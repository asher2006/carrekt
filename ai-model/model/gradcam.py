import base64
import io

import numpy as np
from PIL import Image


def encode_gradcam_overlay(model, preprocessed_image, layer_name=None):
    """Return a base64 PNG Grad-CAM overlay for Keras EfficientNet models."""
    import tensorflow as tf
    import cv2

    if layer_name is None:
        for layer in reversed(model.layers):
            if len(getattr(layer, "output_shape", [])) == 4:
                layer_name = layer.name
                break
    if layer_name is None:
        return None

    grad_model = tf.keras.models.Model(
        [model.inputs],
        [model.get_layer(layer_name).output, model.output],
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(preprocessed_image)
        class_idx = tf.argmax(predictions[0])
        loss = predictions[:, class_idx]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    heatmap = heatmap.numpy()

    original = preprocessed_image[0]
    original = original - original.min()
    original = (original / max(original.max(), 1e-8) * 255).astype(np.uint8)
    heatmap = cv2.resize(heatmap, (original.shape[1], original.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(original, 0.65, heatmap, 0.35, 0)

    buffer = io.BytesIO()
    Image.fromarray(overlay).save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
