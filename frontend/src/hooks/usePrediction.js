import { useState, useCallback } from 'react';
import { predictCar } from '../services/api';

export const usePrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (imageFile) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setCarDetails(null);

    try {
      const result = await predictCar(imageFile);
      
      if (result.success) {
        setPrediction(result.prediction);
        setCarDetails(result.car);
      } else {
        setError(result.message || 'Prediction failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    setCarDetails(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    prediction,
    carDetails,
    loading,
    error,
    predict,
    reset,
  };
};
