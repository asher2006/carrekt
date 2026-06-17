"""
Create additional dataset photo variations from existing car images.

This is an offline helper for improving small class folders before training.
It preserves original files and writes augmented JPEGs into each class folder.
"""

import argparse
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
DEFAULT_SEED = 42


def parse_args():
    parser = argparse.ArgumentParser(description="Augment car dataset folders in place")
    parser.add_argument("--data_dir", type=str, default="../dataset")
    parser.add_argument("--target_per_class", type=int, default=200)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    return parser.parse_args()


def image_files(class_dir):
    return sorted(
        p
        for p in class_dir.iterdir()
        if p.is_file()
        and p.suffix.lower() in IMAGE_EXTENSIONS
        and not p.stem.startswith("aug_")
    )


def existing_image_count(class_dir):
    return sum(
        1
        for p in class_dir.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )


def next_augmented_path(class_dir, index):
    return class_dir / f"aug_{index:05d}.jpg"


def random_crop(image, rng):
    width, height = image.size
    crop_scale = rng.uniform(0.86, 1.0)
    crop_width = max(1, int(width * crop_scale))
    crop_height = max(1, int(height * crop_scale))
    left = rng.randint(0, max(0, width - crop_width))
    top = rng.randint(0, max(0, height - crop_height))
    cropped = image.crop((left, top, left + crop_width, top + crop_height))
    return cropped.resize((width, height), Image.Resampling.LANCZOS)


def random_erasing(image, rng):
    """Randomly erase a small rectangular region (cutout augmentation)."""
    width, height = image.size
    area_ratio = rng.uniform(0.02, 0.12)
    aspect = rng.uniform(0.5, 2.0)
    erase_h = int((height * width * area_ratio / aspect) ** 0.5)
    erase_w = int(erase_h * aspect)
    erase_h = min(erase_h, height)
    erase_w = min(erase_w, width)
    x = rng.randint(0, width - erase_w)
    y = rng.randint(0, height - erase_h)
    fill_color = (rng.randint(0, 255), rng.randint(0, 255), rng.randint(0, 255))
    draw = ImageDraw.Draw(image)
    draw.rectangle([x, y, x + erase_w, y + erase_h], fill=fill_color)
    return image


def perspective_warp(image, rng):
    """Apply a slight perspective transform to simulate different camera angles."""
    width, height = image.size
    magnitude = rng.uniform(0.02, 0.08)
    # Four corners with small random offsets
    coeffs = [
        rng.uniform(-magnitude, magnitude) * width,
        rng.uniform(-magnitude, magnitude) * height,
        rng.uniform(-magnitude, magnitude) * width,
        rng.uniform(-magnitude, magnitude) * height,
        rng.uniform(-magnitude, magnitude) * width,
        rng.uniform(-magnitude, magnitude) * height,
        rng.uniform(-magnitude, magnitude) * width,
        rng.uniform(-magnitude, magnitude) * height,
    ]
    return image.transform(
        (width, height), Image.Transform.PERSPECTIVE, coeffs,
        resample=Image.Resampling.BICUBIC, fillcolor=(245, 245, 245),
    )


def augment(image, rng):
    image = ImageOps.exif_transpose(image).convert("RGB")

    if rng.random() < 0.5:
        image = ImageOps.mirror(image)

    image = random_crop(image, rng)
    image = image.rotate(
        rng.uniform(-10, 10),
        resample=Image.Resampling.BICUBIC,
        expand=False,
        fillcolor=(245, 245, 245),
    )

    # Perspective warp (30% chance)
    if rng.random() < 0.30:
        image = perspective_warp(image, rng)

    # Color jitter (stronger ranges for better generalization)
    image = ImageEnhance.Brightness(image).enhance(rng.uniform(0.70, 1.30))
    image = ImageEnhance.Contrast(image).enhance(rng.uniform(0.75, 1.30))
    image = ImageEnhance.Color(image).enhance(rng.uniform(0.70, 1.30))
    image = ImageEnhance.Sharpness(image).enhance(rng.uniform(0.75, 1.40))

    # Gaussian blur (25% chance)
    if rng.random() < 0.25:
        image = image.filter(ImageFilter.GaussianBlur(radius=rng.uniform(0.15, 1.0)))

    # Random erasing / cutout (20% chance)
    if rng.random() < 0.20:
        image = random_erasing(image, rng)

    return image


def augment_class(class_dir, target_count, rng):
    sources = image_files(class_dir)
    if not sources:
        return 0, "no source images"

    current_count = existing_image_count(class_dir)
    if current_count >= target_count:
        return 0, f"already has {current_count} images"

    created = 0
    next_index = 1
    while next_augmented_path(class_dir, next_index).exists():
        next_index += 1

    while current_count + created < target_count:
        source = rng.choice(sources)
        try:
            with Image.open(source) as image:
                output = augment(image, rng)
                output_path = next_augmented_path(class_dir, next_index)
                output.save(output_path, "JPEG", quality=90, optimize=True)
        except Exception as exc:
            print(f"[WARN] Skipped {source}: {exc}")
            sources = [p for p in sources if p != source]
            if not sources:
                break
            continue

        created += 1
        next_index += 1

    return created, f"{current_count + created} images total"


def main():
    args = parse_args()
    rng = random.Random(args.seed)
    data_dir = Path(args.data_dir).resolve()

    if not data_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found: {data_dir}")

    print(f"Dataset: {data_dir}")
    print(f"Target per class: {args.target_per_class}\n")

    total_created = 0
    for class_dir in sorted(p for p in data_dir.iterdir() if p.is_dir()):
        created, status = augment_class(class_dir, args.target_per_class, rng)
        total_created += created
        print(f"{class_dir.name}: +{created} ({status})")

    print(f"\nCreated {total_created} augmented images.")


if __name__ == "__main__":
    main()
