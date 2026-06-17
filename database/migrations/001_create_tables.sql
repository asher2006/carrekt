-- CarRecog Database Migration: Create cars table
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  segment TEXT,
  year INTEGER,
  price_min INTEGER,
  price_max INTEGER,
  engine TEXT,
  power TEXT,
  torque TEXT,
  transmission TEXT,
  fuel_type TEXT,
  mileage TEXT,
  fuel_tank TEXT,
  seating INTEGER DEFAULT 5,
  body_type TEXT,
  features TEXT[],
  colors TEXT[],
  images TEXT[],
  pros TEXT[],
  cons TEXT[],
  rating NUMERIC(2,1),
  ai_class_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_segment ON cars(segment);
CREATE INDEX IF NOT EXISTS idx_cars_ai_label ON cars(ai_class_label);
CREATE INDEX IF NOT EXISTS idx_cars_slug ON cars(slug);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  predicted_model TEXT,
  confidence NUMERIC(4,3),
  top_predictions JSONB,
  car_id UUID REFERENCES cars(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
