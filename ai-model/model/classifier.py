import os
import random
from pathlib import Path
import numpy as np
from config import (
    MODEL_PATH,
    DEMO_MODE,
    DATASET_DIR,
    KNN_CACHE_PATH,
    USE_KNN_RERANK,
    KNN_TOP_K,
    IMAGE_SIZE,
    LABELS,
    LABEL_TO_NAME,
    NUM_CLASSES,
    CONFIDENCE_THRESHOLD,
)

_model = None
_interpreter = None
_input_details = None
_output_details = None
_demo_reason = None
_feature_model = None
_knn_embeddings = None
_knn_labels = None
_knn_class_names = None

def load_model():
    """Load the trained model if available."""
    global _model, _interpreter, _input_details, _output_details, _demo_reason, _feature_model
    if DEMO_MODE or not os.path.exists(MODEL_PATH):
        _demo_reason = "DEMO_MODE is enabled" if DEMO_MODE else f"Model not found at {MODEL_PATH}"
        print(f"[DEMO] {_demo_reason} - returning simulated predictions")
        return
    try:
        if MODEL_PATH.endswith(".tflite"):
            import tensorflow as tf
            _interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
            _interpreter.allocate_tensors()
            _input_details = _interpreter.get_input_details()
            _output_details = _interpreter.get_output_details()
            print(f"[OK] TFLite model loaded from {MODEL_PATH}")
        else:
            import tensorflow as tf
            _model = tf.keras.models.load_model(MODEL_PATH)
            print(f"[OK] Keras model loaded from {MODEL_PATH}")
            if USE_KNN_RERANK:
                try:
                    _feature_model = tf.keras.Model(_model.input, _model.get_layer("avg_pool").output)
                    _load_or_build_knn_index(tf)
                except Exception as e:
                    print(f"[WARN] KNN reranker disabled: {e}")
    except Exception as e:
        _demo_reason = f"Failed to load model: {e}"
        print(f"[WARN] {_demo_reason}. Falling back to demo mode.")


def model_status() -> dict:
    return {
        "modelPath": MODEL_PATH,
        "loaded": _model is not None or _interpreter is not None,
        "demo": _model is None and _interpreter is None,
        "demoReason": _demo_reason,
        "classes": NUM_CLASSES,
        "knnRerank": _knn_embeddings is not None,
    }


def _normalize_embeddings(embeddings: np.ndarray) -> np.ndarray:
    return embeddings / (np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-8)


def _load_or_build_knn_index(tf):
    global _knn_embeddings, _knn_labels, _knn_class_names

    if os.path.exists(KNN_CACHE_PATH):
        cache = np.load(KNN_CACHE_PATH, allow_pickle=True)
        _knn_embeddings = cache["embeddings"].astype(np.float32)
        _knn_labels = cache["labels"].astype(np.int32)
        _knn_class_names = cache["class_names"].tolist()
        print(f"[OK] KNN embedding index loaded from {KNN_CACHE_PATH}")
        return

    if not os.path.isdir(DATASET_DIR):
        print(f"[WARN] KNN dataset not found at {DATASET_DIR}")
        return

    dataset = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        image_size=IMAGE_SIZE,
        batch_size=16,
        shuffle=False,
        label_mode="int",
    )

    embeddings = []
    labels = []
    for images, batch_labels in dataset:
        batch_embeddings = _feature_model.predict(images, verbose=0)
        embeddings.append(_normalize_embeddings(batch_embeddings))
        labels.extend(batch_labels.numpy().tolist())

    _knn_embeddings = np.concatenate(embeddings).astype(np.float32)
    _knn_labels = np.asarray(labels, dtype=np.int32)
    _knn_class_names = dataset.class_names

    os.makedirs(os.path.dirname(KNN_CACHE_PATH), exist_ok=True)
    np.savez_compressed(
        KNN_CACHE_PATH,
        embeddings=_knn_embeddings,
        labels=_knn_labels,
        class_names=np.asarray(_knn_class_names),
    )
    print(f"[OK] KNN embedding index built and saved to {KNN_CACHE_PATH}")


def _predict_keras(batch: np.ndarray) -> np.ndarray:
    batch_probs = _model.predict(batch, verbose=0)
    return np.mean(batch_probs, axis=0)


def _predict_tflite(batch: np.ndarray) -> np.ndarray:
    predictions = []
    input_shape = _input_details[0]["shape"]
    accepts_batch = len(input_shape) == 4 and input_shape[0] in (-1, 0, batch.shape[0])
    if accepts_batch:
        _interpreter.set_tensor(_input_details[0]["index"], batch.astype(np.float32))
        _interpreter.invoke()
        predictions = _interpreter.get_tensor(_output_details[0]["index"])
    else:
        for image in batch:
            _interpreter.set_tensor(_input_details[0]["index"], np.expand_dims(image, axis=0).astype(np.float32))
            _interpreter.invoke()
            predictions.append(_interpreter.get_tensor(_output_details[0]["index"])[0])
    return np.mean(np.asarray(predictions), axis=0)


def _sharpen_probabilities(probs: np.ndarray, temperature: float = 0.65) -> np.ndarray:
    """Slightly sharpen averaged probabilities without hiding model uncertainty."""
    adjusted = np.exp(np.log(np.clip(probs, 1e-7, 1.0)) / temperature)
    return adjusted / np.sum(adjusted)


def _knn_probabilities(batch: np.ndarray) -> tuple[np.ndarray | None, float | None]:
    if _feature_model is None or _knn_embeddings is None or _knn_labels is None:
        return None, None

    query_embeddings = _feature_model.predict(batch, verbose=0)
    query_embeddings = _normalize_embeddings(query_embeddings)
    query = np.mean(query_embeddings, axis=0)
    query = query / (np.linalg.norm(query) + 1e-8)

    similarities = _knn_embeddings @ query
    top_count = min(KNN_TOP_K, similarities.shape[0])
    top_indices = np.argsort(similarities)[::-1][:top_count]
    best_similarity = float(similarities[top_indices[0]])

    scores = np.zeros(NUM_CLASSES, dtype=np.float32)
    for index in top_indices:
        class_name = _knn_class_names[int(_knn_labels[index])]
        if class_name in LABELS:
            label_index = LABELS.index(class_name)
            scores[label_index] += max(float(similarities[index]), 0.0)

    if np.sum(scores) <= 0:
        return None, best_similarity

    scores = np.exp(scores / 0.18)
    return scores / np.sum(scores), best_similarity

def predict(preprocessed_image: np.ndarray) -> dict:
    """Run prediction on preprocessed image."""
    global _model, _interpreter, _input_details, _output_details

    if _model is not None:
        probs = _predict_keras(preprocessed_image)
        probs = _sharpen_probabilities(probs)
        knn_probs, best_similarity = _knn_probabilities(preprocessed_image)
        if knn_probs is not None and best_similarity is not None and best_similarity >= 0.80:
            probs = (0.75 * probs) + (0.25 * knn_probs)
            probs = probs / np.sum(probs)
    elif _interpreter is not None:
        probs = _predict_tflite(preprocessed_image)
        probs = _sharpen_probabilities(probs)
    else:
        # Demo mode: generate realistic random probabilities
        raw = np.random.dirichlet(np.ones(NUM_CLASSES) * 0.3)
        # Make one class dominant
        dominant = random.randint(0, NUM_CLASSES - 1)
        raw[dominant] += random.uniform(0.5, 0.8)
        probs = raw / raw.sum()

    # Sort by confidence
    top_indices = np.argsort(probs)[::-1]
    top_predictions = []
    for idx in top_indices[:5]:
        label = LABELS[idx]
        top_predictions.append({
            "model": LABEL_TO_NAME.get(label, label),
            "label": label,
            "confidence": round(float(probs[idx]), 4)
        })

    best = top_predictions[0]
    is_uncertain = best["confidence"] < CONFIDENCE_THRESHOLD
    return {
        "model": "Uncertain" if is_uncertain else best["model"],
        "label": None if is_uncertain else best["label"],
        "confidence": best["confidence"],
        "topPredictions": top_predictions[:3],
        "uncertain": is_uncertain,
        "threshold": CONFIDENCE_THRESHOLD,
        "demo": _model is None and _interpreter is None
    }
