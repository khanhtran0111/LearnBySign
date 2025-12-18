"""
FastAPI Service for VSL Inference
Exposes REST API for sign language prediction
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import vsl_inference
import vsl_sequence_inference

app = FastAPI(
    title="VSL Inference API",
    description="Vietnam Sign Language Recognition Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {
        "service": "VSL Inference API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
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


# ===== NEW: Sequence Model Endpoints (60 frames LSTM) =====

class HandLandmarks(BaseModel):
    landmarks: Optional[List[LandmarkPoint]] = None


class SequenceFrameRequest(BaseModel):
    left_hand: Optional[List[LandmarkPoint]] = None
    right_hand: Optional[List[LandmarkPoint]] = None


class SequencePredictRequest(BaseModel):
    frames: List[SequenceFrameRequest] = Field(..., min_length=60, max_length=60)


class SequencePredictionResponse(BaseModel):
    label: str
    confidence: float
    class_index: int
    raw_proba: List[float]
    success: bool


class SequenceInfoResponse(BaseModel):
    sequence_length: int
    features_per_frame: int
    available_actions: List[str]
    confidence_threshold: float


@app.get("/sequence/info", response_model=SequenceInfoResponse)
async def get_sequence_info():
    """Get information about the sequence model requirements"""
    return SequenceInfoResponse(
        sequence_length=vsl_sequence_inference.get_sequence_length(),
        features_per_frame=vsl_sequence_inference.get_features_per_frame(),
        available_actions=vsl_sequence_inference.get_available_actions(),
        confidence_threshold=vsl_sequence_inference.CONF_THRESHOLD
    )


@app.post("/sequence/predict", response_model=SequencePredictionResponse)
async def predict_from_sequence(request: SequencePredictRequest):
    """
    Predict from a sequence of 60 frames.
    Each frame contains left_hand and right_hand landmarks (21 points each).
    """
    try:
        # Convert frames to feature vectors
        frames_features = []
        for frame in request.frames:
            left_hand = [lm.model_dump() for lm in frame.left_hand] if frame.left_hand else []
            right_hand = [lm.model_dump() for lm in frame.right_hand] if frame.right_hand else []
            
            keypoints = vsl_sequence_inference.extract_keypoints_from_landmarks(left_hand, right_hand)
            frames_features.append(keypoints.tolist())
        
        # Predict
        result = vsl_sequence_inference.predict_from_sequence(frames_features)
        
        print(f"[SEQUENCE] Predicted: {result['label']} (confidence: {result['confidence']:.2%}, success: {result['success']})")
        
        return SequencePredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sequence prediction failed: {str(e)}")


class RawSequenceRequest(BaseModel):
    frames: List[List[float]] = Field(..., min_length=60, max_length=60)


@app.post("/sequence/predict-raw", response_model=SequencePredictionResponse)
async def predict_from_raw_sequence(request: RawSequenceRequest):
    """
    Predict from raw feature vectors (60 frames, each 126 floats).
    This is more efficient if client already computed features.
    """
    try:
        result = vsl_sequence_inference.predict_from_sequence(request.frames)
        return SequencePredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sequence prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
