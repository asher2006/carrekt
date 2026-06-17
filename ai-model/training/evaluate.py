"""
Evaluate the trained car classifier against its dataset.

Prints per-class accuracy, overall top-1 and top-3 accuracy,
and a confusion summary showing the most common misclassifications.

Usage:
  python training/evaluate.py --data_dir ../dataset --model ../saved_models/car_classifier.keras
"""

import argparse
import os
import sys
from pathlib import Path
from collections import defaultdict

import numpy as np
from PIL import Image, ImageOps

AI_MODEL_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(AI_MODEL_DIR))


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate CarRecog model")
    parser.add_argument("--data_dir", type=str, default=str(AI_MODEL_DIR / "dataset"))
    parser.add_argument("--model", type=str, default=str(AI_MODEL_DIR / "saved_models" / "car_classifier.keras"))
    parser.add_argument("--labels", type=str, default=str(AI_MODEL_DIR / "saved_models" / "labels.json"))
    parser.add_argument("--img_size", type=int, default=None)
    parser.add_argument("--max_per_class", type=int, default=50, help="Max images to evaluate per class")
    return parser.parse_args()


def load_labels(labels_path):
    import json
    with open(labels_path) as f:
        data = json.load(f)
    return data["labels"], data.get("image_size", 224)


def preprocess_single(image_path, img_size):
    """Preprocess a single image the same way inference does (raw pixels, no normalization)."""
    img = Image.open(image_path)
    img = ImageOps.exif_transpose(img).convert("RGB")
    img = img.resize((img_size, img_size), Image.LANCZOS)
    return np.expand_dims(np.array(img, dtype=np.float32), axis=0)


def main():
    args = parse_args()

    import tensorflow as tf

    labels, default_img_size = load_labels(args.labels)
    img_size = args.img_size or default_img_size

    print(f"\n{'='*60}")
    print(f"  CarRecog Model Evaluation")
    print(f"  Model: {args.model}")
    print(f"  Dataset: {args.data_dir}")
    print(f"  Image size: {img_size}x{img_size}")
    print(f"  Classes: {len(labels)}")
    print(f"{'='*60}\n")

    model = tf.keras.models.load_model(args.model)

    data_root = Path(args.data_dir)
    valid_exts = {".jpg", ".jpeg", ".png", ".webp"}

    total_correct_top1 = 0
    total_correct_top3 = 0
    total_images = 0
    class_results = {}
    confusion = defaultdict(lambda: defaultdict(int))

    for class_idx, class_name in enumerate(labels):
        class_dir = data_root / class_name
        if not class_dir.is_dir():
            print(f"  [SKIP] {class_name}: directory not found")
            continue

        image_files = sorted(
            p for p in class_dir.iterdir()
            if p.is_file() and p.suffix.lower() in valid_exts
            and not p.stem.startswith("aug_")  # Skip augmented images for fair eval
        )[:args.max_per_class]

        if not image_files:
            print(f"  [SKIP] {class_name}: no images")
            continue

        correct_top1 = 0
        correct_top3 = 0

        for image_path in image_files:
            try:
                batch = preprocess_single(image_path, img_size)
                probs = model.predict(batch, verbose=0)[0]
                top1_idx = np.argmax(probs)
                top3_indices = np.argsort(probs)[::-1][:3]

                predicted_class = labels[top1_idx]
                confusion[class_name][predicted_class] += 1

                if top1_idx == class_idx:
                    correct_top1 += 1
                if class_idx in top3_indices:
                    correct_top3 += 1
            except Exception as e:
                print(f"    [WARN] Error processing {image_path.name}: {e}")

        n = len(image_files)
        top1_acc = correct_top1 / n if n > 0 else 0
        top3_acc = correct_top3 / n if n > 0 else 0
        class_results[class_name] = {"top1": top1_acc, "top3": top3_acc, "count": n}
        total_correct_top1 += correct_top1
        total_correct_top3 += correct_top3
        total_images += n

        status = "✅" if top1_acc >= 0.7 else "⚠️" if top1_acc >= 0.4 else "❌"
        print(f"  {status} {class_name:25s} top-1: {top1_acc:5.1%}  top-3: {top3_acc:5.1%}  ({n} images)")

    print(f"\n{'='*60}")
    overall_top1 = total_correct_top1 / total_images if total_images > 0 else 0
    overall_top3 = total_correct_top3 / total_images if total_images > 0 else 0
    print(f"  Overall Top-1 Accuracy: {overall_top1:.1%}  ({total_correct_top1}/{total_images})")
    print(f"  Overall Top-3 Accuracy: {overall_top3:.1%}  ({total_correct_top3}/{total_images})")
    print(f"{'='*60}")

    # Show worst confusions
    print(f"\n  Top Misclassifications:")
    misclassifications = []
    for true_class, preds in confusion.items():
        for pred_class, count in preds.items():
            if true_class != pred_class:
                misclassifications.append((count, true_class, pred_class))
    misclassifications.sort(reverse=True)

    for count, true_class, pred_class in misclassifications[:10]:
        print(f"    {true_class} → {pred_class}: {count} times")

    print()


if __name__ == "__main__":
    main()
