import io
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import AI_PORT
from model.classifier import load_model, model_status, predict
from model.preprocessor import preprocess_image

@asynccontextmanager
async def lifespan(app):
    load_model()
    yield

app = FastAPI(title="CarRecog AI Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-model", "model": model_status()}

@app.post("/predict")
async def predict_car(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    contents = await file.read()
    image = preprocess_image(io.BytesIO(contents))
    result = predict(image)
    return result

if __name__ == "__main__":
    print(f"\nCarRecog AI Service starting on http://localhost:{AI_PORT}\n")
    uvicorn.run("main:app", host="0.0.0.0", port=AI_PORT, reload=True)
