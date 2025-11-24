"""
FastAPI Service for VSL Inference
Exposes REST API for sign language prediction
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict
import vsl_inference

app = FastAPI(
    title="VSL Inference API",
    description="Vietnam Sign Language Recognition Service",
    version="1.0.0"
)

# CORS configuration for NextJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class LandmarkPoint(BaseModel):
    x: float = Field(..., ge=0, le=1, description="X coordinate (0-1)")
    y: float = Field(..., ge=0, le=1, description="Y coordinate (0-1)")
    z: float = Field(..., description="Z coordinate (relative depth)")


class PredictFromFeaturesRequest(BaseModel):
    features: List[float] = Field(..., min_length=63, max_length=63)


class PredictFromLandmarksRequest(BaseModel):
    handed: str = Field(..., pattern="^(Left|Right)$")
    landmarks: List[LandmarkPoint] = Field(..., min_length=21, max_length=21)


class PredictionResponse(BaseModel):
    label: str
    confidence: float
    class_index: int
    raw_proba: List[float]


class HealthResponse(BaseModel):
    status: str
    available_classes: List[str]


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "service": "VSL Inference API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        classes = vsl_inference.get_available_classes()
        return HealthResponse(
            status="healthy",
            available_classes=classes
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@app.post("/predict/features", response_model=PredictionResponse)
async def predict_from_features(request: PredictFromFeaturesRequest):
    """
    Predict from pre-computed feature vector (63 floats).
    This is the most efficient endpoint.
    """
    try:
        result = vsl_inference.predict_from_features(request.features)
        return PredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/landmarks", response_model=PredictionResponse)
async def predict_from_landmarks(request: PredictFromLandmarksRequest):
    """
    Predict from raw landmarks (21 points with x, y, z).
    Feature extraction is done server-side.
    """
    try:
        landmarks_dict = [lm.model_dump() for lm in request.landmarks]
        result = vsl_inference.predict_from_raw_landmarks(
            landmarks_dict,
            request.handed
        )
        
        # Debug logging
        print(f"[DEBUG] Handed: {request.handed}")
        print(f"[DEBUG] Predicted: {result['label']} (confidence: {result['confidence']:.2%})")
        print(f"[DEBUG] Top 3 predictions:")
        top_indices = sorted(range(len(result['raw_proba'])), 
                            key=lambda i: result['raw_proba'][i], 
                            reverse=True)[:3]
        for idx in top_indices:
            print(f"   - Class {idx}: {result['raw_proba'][idx]:.2%}")
        
        return PredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# Alias for backward compatibility
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictFromLandmarksRequest):
    """Alias for /predict/landmarks"""
    return await predict_from_landmarks(request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
