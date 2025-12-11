"""
Realtime Sign Language Inference (fixed-length = 60 frames)
- Bắt đầu ghi khi tay xuất hiện ổn định
- Ghi đúng 60 frame, rồi MỚI dự đoán một lần
- Yêu cầu hạ tay (mất tay khỏi khung vài frame) trước khi thu mới
"""

import os
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


MODEL_WEIGHTS_PATH = r"VSL.h5"

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
N_FEATURES = 21 * 3 * 2  # 2 bàn tay, mỗi tay 21 điểm, (x,y,z)

# =========================
# NGƯỠNG / THAM SỐ
# =========================
CONF_THRESHOLD = 0.80       # chấp nhận dự đoán nếu ≥ ngưỡng này
PRESENCE_START_FRAMES = 5   # cần thấy tay liên tục bấy nhiêu frame để bắt đầu ghi
ABSENCE_END_FRAMES = 10     # cần MẤT tay liên tục bấy nhiêu frame để reset và cho phép ghi mới
HOLD_PRED_FRAMES = 45       # giữ overlay kết quả bấy nhiêu frame

# =========================
# MediaPipe
# =========================
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

def mediapipe_detection(bgr, holistic):
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    results = holistic.process(rgb)
    rgb.flags.writeable = True
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    return bgr, results

def draw_hands(image, results):
    if results.left_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=3),
            mp_drawing.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
        )
    if results.right_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=3),
            mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
        )

def extract_keypoints(results):
    if results.left_hand_landmarks:
        lh = np.array([[lm.x, lm.y, lm.z] for lm in results.left_hand_landmarks.landmark], dtype=np.float32).flatten()
    else:
        lh = np.zeros(21*3, dtype=np.float32)
    if results.right_hand_landmarks:
        rh = np.array([[lm.x, lm.y, lm.z] for lm in results.right_hand_landmarks.landmark], dtype=np.float32).flatten()
    else:
        rh = np.zeros(21*3, dtype=np.float32)
    return np.concatenate([lh, rh], dtype=np.float32)

def build_model(n_classes, seq_len=60, n_features=126):
    model = Sequential()
    model.add(LSTM(32, return_sequences=True, activation='relu', input_shape=(seq_len, n_features)))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(n_classes, activation='softmax'))
    return model

def main():
    # Model
    if not os.path.exists(MODEL_WEIGHTS_PATH):
        raise FileNotFoundError(f"Không tìm thấy trọng số: {MODEL_WEIGHTS_PATH}")
    model = build_model(len(ACTIONS), SEQ_LEN, N_FEATURES)
    model.load_weights(MODEL_WEIGHTS_PATH)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Không mở được camera.")

    # State machine
    STATE_IDLE = 0
    STATE_RECORDING = 1
    STATE_WAIT_ABSENCE = 2

    state = STATE_IDLE
    presence_cnt = 0
    absence_cnt = 0
    sequence = []
    last_pred = ""
    last_prob = 0.0
    hold_left = 0

    with mp_holistic.Holistic(min_detection_confidence=0.5,
                              min_tracking_confidence=0.5) as holistic:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            image, results = mediapipe_detection(frame, holistic)
            draw_hands(image, results)

            hands_present = (results.left_hand_landmarks is not None) or (results.right_hand_landmarks is not None)

            if state == STATE_IDLE:
                sequence.clear()
                absence_cnt = 0
                if hands_present:
                    presence_cnt += 1
                else:
                    presence_cnt = 0

                if presence_cnt >= PRESENCE_START_FRAMES:
                    # bắt đầu thu
                    state = STATE_RECORDING
                    presence_cnt = 0

            elif state == STATE_RECORDING:
                # luôn ghi đủ 60 frame (kể cả khi tay mất, keypoints sẽ là zero)
                kp = extract_keypoints(results)
                sequence.append(kp)
                if len(sequence) >= SEQ_LEN:
                    # dự đoán đúng 1 lần
                    inp = np.expand_dims(np.asarray(sequence, dtype=np.float32), axis=0)  # (1,60,126)
                    probs = model.predict(inp, verbose=0)[0]
                    idx = int(np.argmax(probs))
                    prob = float(probs[idx])

                    if prob >= CONF_THRESHOLD:
                        last_pred = str(ACTIONS[idx])
                        last_prob = prob
                        hold_left = HOLD_PRED_FRAMES
                    else:
                        last_pred = ""
                        last_prob = 0.0
                        hold_left = 0

                    # chuyển sang WAIT_ABSENCE: yêu cầu hạ tay để reset
                    state = STATE_WAIT_ABSENCE
                    sequence.clear()
                    absence_cnt = 0

            elif state == STATE_WAIT_ABSENCE:
                # chỉ khi MẤT tay liên tục mới cho phép vào vòng thu mới
                if hands_present:
                    absence_cnt = 0
                else:
                    absence_cnt += 1
                    if absence_cnt >= ABSENCE_END_FRAMES:
                        state = STATE_IDLE

            # =========================
            # Overlay
            # =========================
            H, W = image.shape[:2]
            cv2.rectangle(image, (0, 0), (W, 60), (20, 20, 20), -1)
            state_text = {0: "IDLE", 1: "RECORDING (60 frames)", 2: "WAIT_ABSENCE"}[state]
            cv2.putText(image, f"STATE: {state_text}", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2, cv2.LINE_AA)

            if state == STATE_RECORDING:
                cv2.putText(image, f"Frames: {len(sequence)}/{SEQ_LEN}", (10, 95),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (245, 117, 16), 2, cv2.LINE_AA)
                # progress bar
                prog = min(len(sequence) / float(SEQ_LEN), 1.0)
                bar_w = int(prog * (W * 0.6))
                cv2.rectangle(image, (10, 110), (10 + bar_w, 130), (245, 117, 16), -1)

            if hold_left > 0 and last_pred:
                hold_left -= 1
                txt = f"{last_pred} ({last_prob*100:.1f}%)"
                (tw, th), _ = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, 1.0, 2)
                x0, y0 = 10, H - 20
                cv2.rectangle(image, (x0 - 10, y0 - th - 10), (x0 + tw + 10, y0 + 10), (0, 128, 0), -1)
                cv2.putText(image, txt, (x0, y0),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2, cv2.LINE_AA)

            hint = "Giu tay ra khoi khung de bat dau ky hieu moi sau khi co ket qua."
            cv2.putText(image, hint, (10, H - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1, cv2.LINE_AA)

            cv2.imshow("Realtime Sign Inference (60 frames)", image)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27:
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
