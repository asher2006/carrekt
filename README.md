# CarRecog — AI-Powered Global Car Recognition

An AI-powered full-stack web application that identifies Indian and global vehicles from uploads or webcam frames and provides top-3 predictions, confidence, specifications, pricing, and features.

## Architecture

```
carrecog/
├── frontend/          # React + Vite (port 5173)
├── backend/           # Node.js + Express (port 5000)
├── ai-model/          # Python + FastAPI + TensorFlow (port 8000)
├── saved_models/      # Keras / TFLite / ONNX exports
└── database/          # Legacy SQL migrations
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- (Optional) MongoDB for production car catalog storage

### 1. Install Dependencies
```bash
npm run install:all
```

Or install individually:
```bash
# Root
npm install

# Frontend
cd frontend && npm install

# Backend
cd backend && npm install

# AI Model
cd ai-model && pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with MongoDB and model settings. The app also works with local JSON fallback.
```

### 3. Seed MongoDB (Optional)
```bash
cd backend
npm run seed:mongo
```

### 4. Start All Services
```bash
npm run dev
```

Or start individually:
```bash
# Terminal 1: AI Service
cd ai-model && python main.py

# Terminal 2: Backend
cd backend && node server.js

# Terminal 3: Frontend
cd frontend && npm run dev
```
bruh
### 5. Open the App
Visit http://localhost:5173

## Demo Mode

The app works without MongoDB or a trained model:
- **Backend**: Uses local JSON data for Indian and global cars
- **AI Service**: Returns simulated top-3 predictions with realistic confidence scores

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Upload image → AI prediction + car specs |
| POST | `/api/predict/camera` | Webcam frame → real-time AI prediction |
| GET | `/api/cars` | List cars (filters: brand, fuelType, segment, search) |
| GET | `/api/car/:model` | Get car details by slug, model name, or AI label |
| POST | `/api/cars/compare` | Compare 2-3 cars |
| GET | `/api/brands` | List all brands |
| GET | `/api/health` | Backend health check |

## Training Your Own Model

1. Collect 200-500 clean images per class, organized by class label:
```
dataset/
├── maruti_swift/
├── hyundai_creta/
├── tata_nexon/
├── toyota_camry/
├── bmw_3_series/
├── mercedes_benz_c_class/
├── tesla_model_3/
└── ...
```

2. Run training:
```bash
cd ai-model
python training/train.py --data_dir ./dataset --warmup_epochs 12 --fine_tune_epochs 18
```

The training pipeline uses EfficientNet-B3 transfer learning, rotation/brightness/zoom/translation/noise augmentation, class weights for class balancing, top-3 validation accuracy, and top-layer fine-tuning.

3. Export a faster inference model:
```bash
python training/export_model.py --model ../saved_models/car_classifier.keras
```

4. Set `DEMO_MODE=false` in `.env`. Use either:
```bash
MODEL_PATH=./saved_models/car_classifier.keras
# or
MODEL_PATH=./saved_models/car_classifier.tflite
```

### Dataset Sources
- Kaggle: Indian car datasets and Stanford Cars mirrors
- Roboflow Universe: vehicle/car make-model datasets
- Stanford Cars / CompCars for international classes
- Brand/media press kits and marketplace images where licensing permits

Keep labels clean: one folder per exact model, remove duplicate angles/watermarked composites, and avoid mixing generations unless you intentionally want a generation-level class.

## Production Notes

- Confidence below `CONFIDENCE_THRESHOLD=0.60` returns `Uncertain`.
- Backend caches repeated prediction payloads for `PREDICTION_CACHE_TTL_MS`.
- Webcam frames are cropped/resized client-side before being sent every ~1.6 seconds.
- MongoDB schema stores `name`, `brand`, `region`, `specs.engine`, `specs.mileage`, `specs.fuel`, and `specs.transmission`.
- TFLite export is supported for lower-latency CPU inference; ONNX export is generated when `tf2onnx` is available.

## Tech Stack
- **Frontend**: React 18, Vite, React Router, Framer Motion, Axios
- **Backend**: Express 4, Supabase JS, Multer
- **AI**: FastAPI, TensorFlow/EfficientNet-B3, TFLite export, Pillow, NumPy
- **Database**: MongoDB / local JSON fallback
