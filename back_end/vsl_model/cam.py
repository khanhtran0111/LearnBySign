import os
import cv2
import numpy as np
import joblib
from collections import Counter, deque
import mediapipe as mp

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

MODEL_PATH = os.path.join(os.path.dirname(__file__), "asl_landmarks_best.joblib")
MIN_DET_CONF = 0.6
MIN_TRACK_CONF = 0.6
CONF_THR = 0.60
HIST_SIZE = 7

def extract_lm(image_bgr, hands):
    img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    res = hands.process(img_rgb)
    if not res.multi_hand_landmarks:
        return None, None
    lm = res.multi_hand_landmarks[0]
    handed = res.multi_handedness[0].classification[0].label if res.multi_handedness else 'Right'
    return lm, handed

def lm_to_feat(lm, handed):
    pts = np.array([[p.x, p.y, p.z] for p in lm.landmark], dtype=np.float32)
    
    if handed == 'Left':
        pts[:,0] = 1.0 - pts[:,0]
    
    wrist = pts[0].copy()
    pts -= wrist
    
    palm_scale = np.linalg.norm(pts[9,:2]) + 1e-6
    pts /= palm_scale
    
    return pts.flatten()

def load_model():
    try:
        bundle = joblib.load(MODEL_PATH)
        model = bundle['model']
        le = bundle['label_encoder']
        classes = bundle['classes']
        print(f"Model loaded successfully!")
        print(f"Available classes: {classes}")
        return model, le, classes
    except FileNotFoundError:
        print(f"Error: Model file '{MODEL_PATH}' not found!")
        print("Please train the model first by running the notebook.")
        return None, None, None
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None, None

def predict_image(image_path, model, le):
    hands = mp_hands.Hands(
        static_image_mode=True, 
        max_num_hands=1, 
        min_detection_confidence=MIN_DET_CONF
    )
    
    img = cv2.imread(image_path)
    if img is None:
        print(f"Cannot load image: {image_path}")
        return None, 0.0
    
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    
    lm, handed = extract_lm(img, hands)
    if lm is None:
        print("No hand detected in image")
        return None, 0.0
    
    feat = lm_to_feat(lm, handed)
    prob = model.predict_proba([feat])[0]
    idx = int(np.argmax(prob))
    confidence = float(np.max(prob))
    predicted_class = le.inverse_transform([idx])[0]
    
    hands.close()
    return predicted_class, confidence

def real_time_prediction():
    model, le, classes = load_model()
    if model is None:
        return
    
    hands_live = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=MIN_DET_CONF,
        min_tracking_confidence=MIN_TRACK_CONF
    )
    
    prediction_history = deque(maxlen=HIST_SIZE)
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Cannot open webcam")
        return
    
    print("ASL Real-time Recognition Started!")
    print("Controls:")
    print("- Press 'q' to quit")
    print("- Press 'r' to reset prediction history")
    print("- Press 'i' to test with image file")
    print("-" * 50)
    
    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            print("Failed to read from webcam")
            break
        
        frame = cv2.flip(frame, 1)
        frame_height, frame_width = frame.shape[:2]
        
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands_live.process(rgb)
        
        cv2.putText(frame, "ASL Real-time Recognition", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, "Press 'q' to quit, 'r' to reset, 'i' for image test", 
                   (10, frame_height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        predicted_text = ""
        confidence = 0.0
        
        if results.multi_hand_landmarks:
            lm = results.multi_hand_landmarks[0]
            handed = results.multi_handedness[0].classification[0].label if results.multi_handedness else 'Right'
            
            try:
                feat = lm_to_feat(lm, handed)
                
                proba = model.predict_proba([feat])[0]
                class_id = int(np.argmax(proba))
                confidence = float(np.max(proba))
                
                prediction_history.append(class_id)
                
                if len(prediction_history) >= 3:
                    most_common_class, _ = Counter(prediction_history).most_common(1)[0]
                    
                    if confidence >= CONF_THR and most_common_class == class_id:
                        predicted_text = le.inverse_transform([class_id])[0]
                
                mp_draw.draw_landmarks(
                    frame, lm, mp_hands.HAND_CONNECTIONS,
                    mp_draw.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                    mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2)
                )
                
                cv2.putText(frame, f"Hand: {handed}", (10, 70),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
                
            except Exception as e:
                cv2.putText(frame, f"Prediction Error: {str(e)[:30]}", (10, 110),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        else:
            cv2.putText(frame, "No hand detected", (10, 70),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            prediction_history.clear()
        
        if predicted_text:
            cv2.putText(frame, f"Sign: {predicted_text.upper()}", (40, 120),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
            cv2.putText(frame, f"Confidence: {confidence:.2%}", (40, 160),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        cv2.putText(frame, f"History: {len(prediction_history)}/{HIST_SIZE}", 
                   (frame_width - 200, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        cv2.imshow("ASL Real-time Recognition", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            prediction_history.clear()
            print("Prediction history reset")
        elif key == ord('i'):
            image_path = input("Enter image path (or press Enter to skip): ").strip()
            if image_path and os.path.exists(image_path):
                result, conf = predict_image(image_path, model, le)
                if result:
                    print(f"Image prediction: {result.upper()} (confidence: {conf:.2%})")
                else:
                    print("No hand detected in image or prediction failed")
            elif image_path:
                print("Image file not found")
    
    cap.release()
    cv2.destroyAllWindows()
    hands_live.close()
    print("Application closed successfully!")

def main():
    print("ASL Sign Language Recognition")
    print("=" * 40)
    
    if not os.path.exists(MODEL_PATH):
        print(f"Model file '{MODEL_PATH}' not found!")
        print("Please train the model first by running the training notebook.")
        return
    
    print("Choose mode:")
    print("1. Real-time webcam recognition")
    print("2. Single image prediction")
    
    try:
        choice = input("Enter choice (1 or 2): ").strip()
        
        if choice == "1":
            real_time_prediction()
        elif choice == "2":
            model, le, classes = load_model()
            if model is None:
                return
            
            image_path = input("Enter image path: ").strip()
            if not os.path.exists(image_path):
                print("Image file not found!")
                return
            
            result, confidence = predict_image(image_path, model, le)
            if result:
                print(f"Prediction: {result.upper()}")
                print(f"Confidence: {confidence:.2%}")
            else:
                print("No hand detected in image")
        else:
            print("Invalid choice!")
    
    except KeyboardInterrupt:
        print("\nApplication interrupted by user")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
