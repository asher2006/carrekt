"""
Download Indian Car Images for Training Dataset.

Uses icrawler (Bing image crawler) to fetch images for each car class.
Images are organized into folders matching our AI class labels.

Usage:
    pip install icrawler
    python training/download_dataset.py
"""

import os
import sys
import time
import logging

# Suppress noisy icrawler logs
logging.getLogger("icrawler").setLevel(logging.ERROR)

from icrawler.builtin import BingImageCrawler

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")
IMAGES_PER_CLASS = 80  # Target 80 images per car model (augmented to 200+ later)

# Multiple search queries per class for diverse angles, lighting, and viewpoints
CAR_CLASSES = {
    "maruti_swift": [
        "Maruti Suzuki Swift 2024 car India exterior",
        "Maruti Swift hatchback front side view road",
        "Maruti Swift 2024 driving on road India",
    ],
    "maruti_baleno": [
        "Maruti Suzuki Baleno 2024 car India exterior",
        "Maruti Baleno premium hatchback front angle",
        "Maruti Baleno 2024 side profile India road",
    ],
    "maruti_brezza": [
        "Maruti Suzuki Brezza 2024 SUV India exterior",
        "Maruti Brezza compact SUV front view 2024",
        "Maruti Brezza on road India side angle",
    ],
    "maruti_alto": [
        "Maruti Suzuki Alto K10 2024 hatchback India",
        "Maruti Alto K10 small car front view",
        "Maruti Alto 2024 exterior side angle India",
    ],
    "hyundai_creta": [
        "Hyundai Creta 2024 SUV India exterior",
        "Hyundai Creta front three quarter view 2024",
        "Hyundai Creta SUV road India side profile",
    ],
    "hyundai_venue": [
        "Hyundai Venue 2024 compact SUV India",
        "Hyundai Venue front side exterior view 2024",
        "Hyundai Venue subcompact SUV road India",
    ],
    "hyundai_i20": [
        "Hyundai i20 2024 premium hatchback India",
        "Hyundai i20 front design exterior angle",
        "Hyundai i20 2024 on road India side view",
    ],
    "tata_nexon": [
        "Tata Nexon 2024 compact SUV India exterior",
        "Tata Nexon front three quarter view on road",
        "Tata Nexon 2024 side profile India",
    ],
    "tata_punch": [
        "Tata Punch 2024 micro SUV India exterior",
        "Tata Punch front view on road 2024",
        "Tata Punch compact SUV side angle India",
    ],
    "tata_harrier": [
        "Tata Harrier 2024 SUV India exterior",
        "Tata Harrier front design three quarter view",
        "Tata Harrier midsize SUV road India side",
    ],
    "tata_safari": [
        "Tata Safari 2024 7 seater SUV India",
        "Tata Safari front three quarter exterior view",
        "Tata Safari large SUV on road India 2024",
    ],
    "kia_seltos": [
        "Kia Seltos 2024 SUV India exterior",
        "Kia Seltos front design on road 2024",
        "Kia Seltos compact SUV side profile India",
    ],
    "kia_sonet": [
        "Kia Sonet 2024 compact SUV India",
        "Kia Sonet front three quarter road view",
        "Kia Sonet subcompact SUV side angle India",
    ],
    "mahindra_thar": [
        "Mahindra Thar 2024 off road SUV India",
        "Mahindra Thar ROXX front exterior view",
        "Mahindra Thar 4x4 SUV side profile India",
    ],
    "mahindra_xuv700": [
        "Mahindra XUV700 2024 SUV India exterior",
        "Mahindra XUV700 front three quarter view road",
        "Mahindra XUV700 large SUV side angle India",
    ],
    "mahindra_scorpio": [
        "Mahindra Scorpio N 2024 SUV India exterior",
        "Mahindra Scorpio N front design view on road",
        "Mahindra Scorpio N body on frame SUV side India",
    ],
    "toyota_fortuner": [
        "Toyota Fortuner 2024 SUV India exterior",
        "Toyota Fortuner premium SUV front view road",
        "Toyota Fortuner side profile on road India",
    ],
    "toyota_innova": [
        "Toyota Innova Crysta 2024 MPV India",
        "Toyota Innova Crysta front three quarter view",
        "Toyota Innova Hycross MPV side angle India",
    ],
    "mg_hector": [
        "MG Hector 2024 SUV India exterior",
        "MG Hector front design three quarter view",
        "MG Hector midsize SUV side profile India",
    ],
    "honda_city": [
        "Honda City 2024 sedan India exterior",
        "Honda City sedan front three quarter view road",
        "Honda City 2024 side profile on road India",
    ],
}


def download_images():
    """Download images for all car classes."""
    os.makedirs(DATASET_DIR, exist_ok=True)
    total_classes = len(CAR_CLASSES)

    print(f"\n{'='*60}")
    print(f"  CarRecog Dataset Downloader")
    print(f"  Classes: {total_classes} | Images per class: {IMAGES_PER_CLASS}")
    print(f"  Target directory: {DATASET_DIR}")
    print(f"{'='*60}\n")

    for idx, (label, queries) in enumerate(CAR_CLASSES.items(), 1):
        class_dir = os.path.join(DATASET_DIR, label)
        os.makedirs(class_dir, exist_ok=True)

        # Check existing images
        existing = len([f for f in os.listdir(class_dir)
                       if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])

        if existing >= IMAGES_PER_CLASS:
            print(f"[{idx}/{total_classes}] {label}: Already has {existing} images. Skipping.")
            continue

        images_needed = IMAGES_PER_CLASS - existing
        per_query = max(1, images_needed // len(queries))
        print(f"[{idx}/{total_classes}] Downloading ~{images_needed} images for: {label}")

        for query in queries:
            print(f"  Query: '{query}'")
            try:
                crawler = BingImageCrawler(
                    storage={"root_dir": class_dir},
                    log_level=logging.ERROR,
                )
                crawler.crawl(
                    keyword=query,
                    max_num=per_query,
                    min_size=(400, 300),  # Skip tiny / low-quality images
                )
            except Exception as e:
                print(f"  [WARN] Download failed for {label}: {e}")

            time.sleep(2)  # Be polite to the search engine

        # Count downloaded
        final_count = len([f for f in os.listdir(class_dir)
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
        print(f"  -> {label}: {final_count} images total\n")

    # Print summary
    print(f"\n{'='*60}")
    print(f"  Download Summary")
    print(f"{'='*60}")
    total_images = 0
    for label in CAR_CLASSES:
        class_dir = os.path.join(DATASET_DIR, label)
        if os.path.exists(class_dir):
            count = len([f for f in os.listdir(class_dir)
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            total_images += count
            status = "OK" if count >= 10 else "LOW"
            print(f"  [{status}] {label}: {count} images")
        else:
            print(f"  [MISS] {label}: 0 images")

    print(f"\n  Total: {total_images} images across {total_classes} classes")
    print(f"  Dataset directory: {DATASET_DIR}")
    print(f"{'='*60}\n")

    if total_images > 0:
        print("  Next step: Train the model with:")
        print("    python training/train.py --data_dir ./dataset --epochs 20")
    else:
        print("  [WARN] No images downloaded. Check your internet connection.")


if __name__ == "__main__":
    download_images()
