import os
from dotenv import load_dotenv

# Load .env from project root
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

BASE_DIR = os.path.dirname(__file__)


def _resolve_model_path(path):
    if os.path.isabs(path):
        return path
    return os.path.join(BASE_DIR, path)


# Model settings
MODEL_PATH = _resolve_model_path(os.getenv("MODEL_PATH", "saved_models/car_classifier.keras"))
_demo_mode = os.getenv("DEMO_MODE")
DEMO_MODE = _demo_mode.lower() == "true" if _demo_mode is not None else not os.path.exists(MODEL_PATH)
AI_PORT = int(os.getenv("AI_PORT", "8000"))
DATASET_DIR = os.getenv("DATASET_DIR", os.path.join(BASE_DIR, "dataset"))
KNN_CACHE_PATH = os.getenv("KNN_CACHE_PATH", os.path.join(BASE_DIR, "saved_models", "embedding_index.npz"))
USE_KNN_RERANK = os.getenv("USE_KNN_RERANK", "true").lower() == "true"
KNN_TOP_K = int(os.getenv("KNN_TOP_K", "7"))
import json

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))

# Try to load labels and image size from saved_models/labels.json
try:
    with open(os.path.join(BASE_DIR, "saved_models", "labels.json"), "r") as f:
        _data = json.load(f)
        LABELS = _data["labels"]
        # labels.json has "image_size": 224
        IMAGE_SIZE = (_data.get("image_size", 300), _data.get("image_size", 300))
except Exception:
    IMAGE_SIZE = (300, 300)
    LABELS = [
        "audi_a4", "audi_q5", "bmw_3_series", "bmw_x5", "ford_mustang",
        "honda_city", "hyundai_creta", "hyundai_i20", "hyundai_venue",
        "kia_seltos", "kia_sonet", "mahindra_scorpio", "mahindra_thar",
        "mahindra_xuv700", "maruti_alto", "maruti_baleno", "maruti_brezza",
        "maruti_swift", "mercedes_benz_c_class", "mercedes_benz_gla",
        "mg_hector", "tata_harrier", "tata_nexon", "tata_punch",
        "tata_safari", "tesla_model_3", "tesla_model_y",
        "toyota_camry", "toyota_corolla", "toyota_fortuner", "toyota_innova",
        "toyota_rav4"
    ]
NUM_CLASSES = len(LABELS)

LABEL_TO_NAME = {
    "audi_a4": "Audi A4", "audi_q5": "Audi Q5",
    "bmw_3_series": "BMW 3 Series", "bmw_x5": "BMW X5",
    "ford_mustang": "Ford Mustang",
    "maruti_swift": "Maruti Swift", "maruti_baleno": "Maruti Baleno",
    "maruti_brezza": "Maruti Brezza", "maruti_alto": "Maruti Alto K10",
    "hyundai_creta": "Hyundai Creta", "hyundai_venue": "Hyundai Venue",
    "hyundai_i20": "Hyundai i20", "tata_nexon": "Tata Nexon",
    "tata_punch": "Tata Punch", "tata_harrier": "Tata Harrier",
    "tata_safari": "Tata Safari", "kia_seltos": "Kia Seltos",
    "kia_sonet": "Kia Sonet", "mahindra_thar": "Mahindra Thar",
    "mahindra_xuv700": "Mahindra XUV700", "mahindra_scorpio": "Mahindra Scorpio-N",
    "mercedes_benz_c_class": "Mercedes-Benz C-Class",
    "mercedes_benz_gla": "Mercedes-Benz GLA",
    "toyota_fortuner": "Toyota Fortuner", "toyota_innova": "Toyota Innova Crysta",
    "toyota_camry": "Toyota Camry", "toyota_corolla": "Toyota Corolla",
    "toyota_rav4": "Toyota RAV4",
    "mg_hector": "MG Hector", "honda_city": "Honda City",
    "tesla_model_3": "Tesla Model 3", "tesla_model_y": "Tesla Model Y"
}
