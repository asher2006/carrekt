from PIL import Image, ImageOps, ImageFilter
import numpy as np
from config import IMAGE_SIZE


def _to_model_array(img: Image.Image) -> np.ndarray:
    """Resize to model input size and cast to float32.
    The retrained model has EfficientNet's preprocess_input baked into its graph,
    so inference must NOT apply any additional normalization — just raw pixels.
    """
    resized = img.resize(IMAGE_SIZE, Image.LANCZOS)
    return np.array(resized, dtype=np.float32)


def _center_crop(img: Image.Image) -> Image.Image:
    width, height = img.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return img.crop((left, top, left + side, top + side))


def _padded_square(img: Image.Image) -> Image.Image:
    width, height = img.size
    side = max(width, height)
    background = img.resize((side, side), Image.LANCZOS).filter(ImageFilter.GaussianBlur(radius=18))
    offset = ((side - width) // 2, (side - height) // 2)
    background.paste(img, offset)
    return background


def _horizontal_crop(img: Image.Image, anchor: str) -> Image.Image:
    width, height = img.size
    if width <= height:
        return _center_crop(img)

    crop_width = max(int(width * 0.82), height)
    crop_width = min(crop_width, width)
    if anchor == "left":
        left = 0
    elif anchor == "right":
        left = width - crop_width
    else:
        left = (width - crop_width) // 2
    return img.crop((left, 0, left + crop_width, height))


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Build a small inference batch that is more tolerant of uploaded photo framing."""
    img = Image.open(image_bytes)
    img = ImageOps.exif_transpose(img).convert("RGB")

    variants = [
        img,
        _padded_square(img),
        _center_crop(img),
        _horizontal_crop(img, "left"),
        _horizontal_crop(img, "right"),
    ]

    return np.stack([_to_model_array(variant) for variant in variants], axis=0)
