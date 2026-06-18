FROM python:3.10-slim

# Install system dependencies needed for OpenCV, PIL, and general building
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Copy requirements file first to cache dependency layers
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and pre-trained models
COPY . .

EXPOSE 8000

# Run FastAPI app
CMD ["python", "main.py"]
