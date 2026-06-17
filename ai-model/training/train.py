"""
Train a production-ready car classifier with EfficientNet-B3 transfer learning.

Dataset layout:
  dataset/
    maruti_swift/
      image_001.jpg
    tesla_model_3/
      image_001.jpg

Recommended target: 200-500 clean images per class, split by vehicle model.
"""

import argparse
import json
import os
from pathlib import Path

AI_MODEL_DIR = Path(__file__).resolve().parents[1]


def parse_args():
    parser = argparse.ArgumentParser(description="Train CarRecog EfficientNet-B3 classifier")
    parser.add_argument("--data_dir", type=str, required=True)
    parser.add_argument("--output", type=str, default=str(AI_MODEL_DIR / "saved_models" / "car_classifier.keras"))
    parser.add_argument("--labels_output", type=str, default=str(AI_MODEL_DIR / "saved_models" / "labels.json"))
    parser.add_argument("--work_dir", type=str, default=str(AI_MODEL_DIR / ".training_cache"))
    parser.add_argument("--img_size", type=int, default=224)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--warmup_epochs", type=int, default=15)
    parser.add_argument("--fine_tune_epochs", type=int, default=25)
    parser.add_argument("--unfreeze_layers", type=int, default=80)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--resume", action="store_true", help="Resume from checkpoint if it exists")
    return parser.parse_args()


def count_images_by_class(data_dir):
    counts = {}
    for class_dir in sorted(Path(data_dir).iterdir()):
        if class_dir.is_dir():
            counts[class_dir.name] = sum(
                1 for p in class_dir.rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
            )
    return counts


def prepare_dataset(data_dir, work_dir):
    """Convert all source images to RGB JPEG files TensorFlow can decode reliably."""
    from PIL import Image, ImageOps, UnidentifiedImageError

    source_root = Path(data_dir)
    prepared_root = Path(work_dir) / "dataset_jpeg"
    valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
    skipped = []

    if prepared_root.exists():
        for path in prepared_root.rglob("*"):
            if path.is_file():
                path.unlink()

    for class_dir in sorted(source_root.iterdir()):
        if not class_dir.is_dir():
            continue

        output_dir = prepared_root / class_dir.name
        output_dir.mkdir(parents=True, exist_ok=True)

        image_index = 1
        for image_path in sorted(class_dir.rglob("*")):
            if image_path.suffix.lower() not in valid_exts:
                continue
            try:
                with Image.open(image_path) as img:
                    fixed = ImageOps.exif_transpose(img).convert("RGB")
                    fixed.save(output_dir / f"{image_index:05d}.jpg", format="JPEG", quality=94, optimize=True)
                    image_index += 1
            except (OSError, UnidentifiedImageError) as exc:
                skipped.append((str(image_path), str(exc)))

    if skipped:
        print("[WARN] Skipped unreadable images:")
        for image_path, reason in skipped:
            print(f"  - {image_path}: {reason}")

    return str(prepared_root)


def build_datasets(tf, args):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        args.data_dir,
        validation_split=0.2,
        subset="training",
        seed=args.seed,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        label_mode="categorical",
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        args.data_dir,
        validation_split=0.2,
        subset="validation",
        seed=args.seed,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        label_mode="categorical",
    )

    class_names = train_ds.class_names
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.shuffle(1024, seed=args.seed).prefetch(autotune)
    val_ds = val_ds.prefetch(autotune)
    return train_ds, val_ds, class_names


def class_weights_for(class_names, counts):
    max_count = max(counts.values())
    weights = {}
    for index, class_name in enumerate(class_names):
        count = max(counts.get(class_name, 1), 1)
        weights[index] = max_count / count
    return weights


def build_model(tf, num_classes, img_size):
    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    # Data augmentation layers (only active during training)
    x = tf.keras.layers.RandomFlip("horizontal")(inputs)
    x = tf.keras.layers.RandomRotation(0.08)(x)
    x = tf.keras.layers.RandomZoom(0.15)(x)
    x = tf.keras.layers.RandomTranslation(0.08, 0.08)(x)
    x = tf.keras.layers.RandomBrightness(0.20)(x)
    x = tf.keras.layers.GaussianNoise(0.03)(x)

    # EfficientNet's own preprocessing (scales pixels to expected range).
    # This is baked into the model graph, so inference must NOT apply it again.
    x = tf.keras.applications.efficientnet.preprocess_input(x)

    base = tf.keras.applications.EfficientNetB3(
        include_top=False,
        weights="imagenet",
        input_tensor=x,
    )
    base.trainable = False

    x = tf.keras.layers.GlobalAveragePooling2D(name="avg_pool")(base.output)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.35)(x)
    x = tf.keras.layers.Dense(512, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs, outputs)
    return model, base


def compile_model(tf, model, learning_rate):
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
        metrics=[
            "accuracy",
            tf.keras.metrics.TopKCategoricalAccuracy(k=3, name="top_3_accuracy"),
        ],
    )


def main():
    args = parse_args()

    import tensorflow as tf

    prepared_data_dir = prepare_dataset(args.data_dir, args.work_dir)
    counts = count_images_by_class(prepared_data_dir)
    if not counts:
        raise ValueError(f"No class folders found in {args.data_dir}")

    underfilled = {name: count for name, count in counts.items() if count < 200}
    if underfilled:
        print("[WARN] These classes are below the recommended 200 images:")
        for name, count in underfilled.items():
            print(f"  - {name}: {count}")

    args.data_dir = prepared_data_dir
    train_ds, val_ds, class_names = build_datasets(tf, args)
    weights = class_weights_for(class_names, counts)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=7, restore_best_weights=True, monitor="val_top_3_accuracy"),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.3, patience=3, min_lr=1e-7),
        tf.keras.callbacks.ModelCheckpoint(args.output, save_best_only=True, monitor="val_top_3_accuracy"),
    ]

    resumed = False
    if args.resume and os.path.exists(args.output):
        print(f"\n[INFO] Resuming training. Loading existing model from {args.output}")
        try:
            model = tf.keras.models.load_model(args.output)
            resumed = True
        except Exception as e:
            print(f"[WARN] Failed to load model for resume: {e}. Starting from scratch.")

    if not resumed:
        model, base = build_model(tf, len(class_names), args.img_size)
        compile_model(tf, model, learning_rate=2e-4)
        print("\n[1/2] Training classification head")
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=args.warmup_epochs,
            callbacks=callbacks,
            class_weight=weights,
        )
        print("\n[2/2] Fine-tuning top EfficientNet-B3 layers")
        base.trainable = True
        for layer in base.layers[:-args.unfreeze_layers]:
            layer.trainable = False
    else:
        print("\n[2/2] Fine-tuning top EfficientNet-B3 layers (Resumed)")
        model.trainable = True
        # Freeze all layers of the base model except the last unfreeze_layers
        # The custom head has 6 layers
        num_base_layers = len(model.layers) - 6
        freeze_until = num_base_layers - args.unfreeze_layers
        for i, layer in enumerate(model.layers):
            if i < freeze_until:
                layer.trainable = False
            else:
                layer.trainable = True

    compile_model(tf, model, learning_rate=1e-5)
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.warmup_epochs + args.fine_tune_epochs,
        initial_epoch=args.warmup_epochs,
        callbacks=callbacks,
        class_weight=weights,
    )

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    model.save(args.output)
    with open(args.labels_output, "w", encoding="utf-8") as f:
        json.dump({"labels": class_names, "image_size": args.img_size}, f, indent=2)

    print(f"\n[OK] Model saved to {args.output}")
    print(f"[OK] Labels saved to {args.labels_output}")


if __name__ == "__main__":
    main()
