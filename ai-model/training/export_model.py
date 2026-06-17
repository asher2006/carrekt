"""
Export a trained Keras model to TensorFlow Lite and optionally ONNX.

Usage:
  python training/export_model.py --model ../saved_models/car_classifier.keras
"""

import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Export CarRecog model")
    parser.add_argument("--model", required=True)
    parser.add_argument("--tflite", default="../saved_models/car_classifier.tflite")
    parser.add_argument("--onnx", default="../saved_models/car_classifier.onnx")
    parser.add_argument("--skip_onnx", action="store_true")
    args = parser.parse_args()

    import tensorflow as tf

    model = tf.keras.models.load_model(args.model)

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    Path(args.tflite).parent.mkdir(parents=True, exist_ok=True)
    Path(args.tflite).write_bytes(tflite_model)
    print(f"[OK] TFLite model exported to {args.tflite}")

    if not args.skip_onnx:
        try:
            import tf2onnx

            spec = (tf.TensorSpec(model.inputs[0].shape, tf.float32, name="image"),)
            tf2onnx.convert.from_keras(model, input_signature=spec, output_path=args.onnx)
            print(f"[OK] ONNX model exported to {args.onnx}")
        except Exception as exc:
            print(f"[WARN] ONNX export skipped: {exc}")


if __name__ == "__main__":
    main()
