"""
VSL Sequence Inference Module - For 60-frame LSTM model
Handles model loading and prediction for sentence/phrase recognition
"""
import os
import numpy as np
from typing import Dict, List, Tuple
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# Global model cache
_SEQ_MODEL = None

MODEL_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "..", "scripts", "vsl_high_model", "VSL.h5")

# Actions/Labels từ Model.py
ACTIONS = np.array([
    'ban dang lam gi', 'ban di dau the', 'ban hieu ngon ngu ky hieu khong', 'ban hoc lop may',
    'ban khoe khong', 'ban muon gio roi', 'ban phai canh giac', 'ban ten la gi', 'ban tien bo day',
    'ban trong cau co the', 'bo me toi cung la nguoi Diec', 'cai nay bao nhieu tien',
    'cai nay la cai gi', 'cam on', 'cap cuu', 'chuc mung',
    'chung toi giao tiep voi nhau bang ngon ngu ky hieu',
    'con yeu me', 'cong viec cua ban la gi', 'hen gap lai cac ban', 'mon nay khong ngon',
    'toi bi chong mat', 'toi bi cuop', 'toi bi dau dau', 'toi bi dau hong', 'toi bi ket xe',
    'toi bi lac', 'toi bi phan biet doi xu', 'toi cam thay rat hoi hop', 'toi cam thay rat vui',
    'toi can an sang', 'toi can di ve sinh', 'toi can gap bac si', 'toi can phien dich',
    'toi can thuoc', 'toi dang an sang', 'toi dang buon', 'toi dang o ben xe',
    'toi dang o cong vien', 'toi dang phai cach ly', 'toi dang phan van', 'toi di sieu thi',
    'toi di toi Ha Noi', 'toi doc kem', 'toi khoi benh roi', 'toi khong dem theo tien',
    'toi khong hieu', 'toi khong quan tam', 'toi la hoc sinh', 'toi la nguoi Diec',
    'toi la tho theu', 'toi lam viec o cua hang', 'toi nham dia chi', 'toi song o Ha Noi',
    'toi thay doi bung', 'toi thay nho ban', 'toi thich an mi', 'toi thich phim truyen',
    'toi viet kem', 'xin chao'
], dtype=object)

SEQ_LEN = 60          # cố định 60 frame
N_FEATURES = 21 * 3 * 2  # 2 bàn tay, mỗi tay 21 điểm, (x,y,z) = 126

CONF_THRESHOLD = 0.80  # chấp nhận dự đoán nếu ≥ ngưỡng này


def build_model(n_classes: int, seq_len: int = 60, n_features: int = 126) -> Sequential:
    """Build the LSTM model architecture"""
    model = Sequential()
    model.add(LSTM(32, return_sequences=True, activation='relu', input_shape=(seq_len, n_features)))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(n_classes, activation='softmax'))
    return model


def load_sequence_model() -> Sequential:
    """
    Load model once and cache it globally.
    Returns: model
    """
    global _SEQ_MODEL
    
    if _SEQ_MODEL is not None:
        return _SEQ_MODEL
    
    if not os.path.exists(MODEL_WEIGHTS_PATH):
        raise FileNotFoundError(f"Model weights not found: {MODEL_WEIGHTS_PATH}")
    
    _SEQ_MODEL = build_model(len(ACTIONS), SEQ_LEN, N_FEATURES)
    _SEQ_MODEL.load_weights(MODEL_WEIGHTS_PATH)
    print("[OK] VSL Sequence Model loaded successfully!")
    print(f"[OK] Available actions: {len(ACTIONS)}")
    return _SEQ_MODEL


def extract_keypoints_from_landmarks(left_hand: List[Dict], right_hand: List[Dict]) -> np.ndarray:
    """
    Extract keypoints from hand landmarks.
    
    Args:
        left_hand: List of 21 landmarks for left hand (or empty list)
        right_hand: List of 21 landmarks for right hand (or empty list)
    
    Returns:
        Flattened feature vector of length 126 (21*3*2)
    """
    # Left hand
    if left_hand and len(left_hand) == 21:
        lh = np.array([[lm['x'], lm['y'], lm['z']] for lm in left_hand], dtype=np.float32).flatten()
    else:
        lh = np.zeros(21 * 3, dtype=np.float32)
    
    # Right hand
    if right_hand and len(right_hand) == 21:
        rh = np.array([[lm['x'], lm['y'], lm['z']] for lm in right_hand], dtype=np.float32).flatten()
    else:
        rh = np.zeros(21 * 3, dtype=np.float32)
    
    return np.concatenate([lh, rh], dtype=np.float32)


def predict_from_sequence(frames: List[List[float]]) -> Dict:
    """
    Predict from a sequence of 60 frames.
    
    Args:
        frames: List of 60 feature vectors, each of length 126
    
    Returns:
        {
            "label": str,
            "confidence": float,
            "class_index": int,
            "raw_proba": List[float],
            "success": bool
        }
    """
    model = load_sequence_model()
    
    if len(frames) != SEQ_LEN:
        raise ValueError(f"Expected {SEQ_LEN} frames, got {len(frames)}")
    
    # Validate each frame
    for i, frame in enumerate(frames):
        if len(frame) != N_FEATURES:
            raise ValueError(f"Frame {i} has {len(frame)} features, expected {N_FEATURES}")
    
    # Prepare input
    inp = np.expand_dims(np.asarray(frames, dtype=np.float32), axis=0)  # (1, 60, 126)
    
    # Predict
    probs = model.predict(inp, verbose=0)[0]
    idx = int(np.argmax(probs))
    prob = float(probs[idx])
    
    # Check confidence threshold
    if prob >= CONF_THRESHOLD:
        return {
            "label": str(ACTIONS[idx]),
            "confidence": prob,
            "class_index": idx,
            "raw_proba": probs.tolist(),
            "success": True
        }
    else:
        return {
            "label": "",
            "confidence": prob,
            "class_index": idx,
            "raw_proba": probs.tolist(),
            "success": False
        }


def get_available_actions() -> List[str]:
    """Get list of available action labels"""
    return ACTIONS.tolist()


def get_sequence_length() -> int:
    """Get required sequence length"""
    return SEQ_LEN


def get_features_per_frame() -> int:
    """Get number of features per frame"""
    return N_FEATURES
