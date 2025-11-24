"""
VSL Inference Module - Core logic extracted from cam.py
Handles model loading and prediction without GUI dependencies
"""
import os
import numpy as np
import joblib
from typing import Dict, List, Tuple, Optional

# Global model cache
_MODEL = None
_LABEL_ENCODER = None
_CLASSES = None

MODEL_PATH = os.path.join(os.path.dirname(__file__), "asl_landmarks_best.joblib")


def load_model_once() -> Tuple[object, object, List[str]]:
    """
    Load model once and cache it globally.
    Returns: (model, label_encoder, classes)
    """
    global _MODEL, _LABEL_ENCODER, _CLASSES
    
    if _MODEL is not None:
        return _MODEL, _LABEL_ENCODER, _CLASSES
    
    try:
        bundle = joblib.load(MODEL_PATH)
        _MODEL = bundle['model']
        _LABEL_ENCODER = bundle['label_encoder']
        _CLASSES = bundle['classes']
        print("[OK] Model loaded successfully!")
        print(f"[OK] Available classes: {_CLASSES}")
        return _MODEL, _LABEL_ENCODER, _CLASSES
    except FileNotFoundError:
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found! Please train the model first.")
    except Exception as e:
        raise RuntimeError(f"Error loading model: {e}")


def lm_to_feat(landmarks_array: np.ndarray, handed: str) -> np.ndarray:
    """
    Convert 21 landmarks (21x3 array) to normalized feature vector (63,).
    
    Args:
        landmarks_array: numpy array of shape (21, 3) with [x, y, z] coordinates
        handed: "Left" or "Right"
    
    Returns:
        Flattened feature vector of length 63
    """
    pts = landmarks_array.copy()
    
    # Flip x-axis for left hand
    if handed == 'Left':
        pts[:, 0] = 1.0 - pts[:, 0]
    
    # Translate to wrist origin
    wrist = pts[0].copy()
    pts -= wrist
    
    # Normalize by palm scale
    palm_scale = np.linalg.norm(pts[9, :2]) + 1e-6
    pts /= palm_scale
    
    return pts.flatten()


def predict_from_features(features: List[float]) -> Dict:
    """
    Predict from pre-computed feature vector (length 63).
    
    Args:
        features: List of 63 floats (normalized landmarks)
    
    Returns:
        {
            "label": str,
            "confidence": float,
            "class_index": int,
            "raw_proba": List[float]
        }
    """
    model, le, classes = load_model_once()
    
    if len(features) != 63:
        raise ValueError(f"Expected 63 features, got {len(features)}")
    
    feat_array = np.array(features, dtype=np.float32).reshape(1, -1)
    
    # Get prediction probabilities
    proba = model.predict_proba(feat_array)[0]
    class_index = int(np.argmax(proba))
    confidence = float(np.max(proba))
    
    # Get label
    label = le.inverse_transform([class_index])[0]
    
    return {
        "label": str(label).upper(),  # Normalize to uppercase
        "confidence": confidence,
        "class_index": class_index,
        "raw_proba": proba.tolist()
    }


def predict_from_raw_landmarks(
    landmarks: List[Dict[str, float]], 
    handed: str
) -> Dict:
    """
    Predict from raw landmarks with automatic feature extraction.
    
    Args:
        landmarks: List of 21 dicts with keys 'x', 'y', 'z'
        handed: "Left" or "Right"
    
    Returns:
        {
            "label": str,
            "confidence": float,
            "class_index": int,
            "raw_proba": List[float]
        }
    """
    if len(landmarks) != 21:
        raise ValueError(f"Expected 21 landmarks, got {len(landmarks)}")
    
    # Convert to numpy array (21, 3)
    pts = np.array(
        [[lm['x'], lm['y'], lm['z']] for lm in landmarks],
        dtype=np.float32
    )
    
    # Extract features
    features = lm_to_feat(pts, handed)
    
    # Predict
    return predict_from_features(features.tolist())


def get_available_classes() -> List[str]:
    """Get list of available classes from loaded model."""
    _, _, classes = load_model_once()
    return classes


# Preload model on module import
try:
    load_model_once()
except Exception as e:
    print(f"[WARNING] Could not preload model: {e}")
