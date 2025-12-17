# LearnBySign

**Nền tảng học Ngôn ngữ Ký hiệu Việt Nam tích hợp AI Computer Vision**

LearnBySign là một hệ thống học tập thông minh ứng dụng công nghệ **Computer Vision** và **Deep Learning** để nhận diện và đánh giá cử chỉ ngôn ngữ ký hiệu theo thời gian thực. Dự án hướng đến việc tạo ra một công cụ hỗ trợ học tập hiệu quả cho cộng đồng điếc/khiếm thính và những người muốn giao tiếp bằng ngôn ngữ ký hiệu.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![AI](https://img.shields.io/badge/AI-MediaPipe%20%7C%20LSTM-orange.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ AI nhận diện](#công-nghệ-ai-nhận-diện)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Đóng góp](#đóng-góp)

---

## Tổng quan

### Vấn đề giải quyết

Ngôn ngữ ký hiệu là phương tiện giao tiếp chính của cộng đồng điếc/khiếm thính, nhưng việc học tập thường gặp nhiều khó khăn:
- Thiếu giáo viên có chuyên môn
- Chi phí học cao
- Không có phản hồi tức thì khi tự học

### Giải pháp

LearnBySign sử dụng **AI Computer Vision** để:
- Nhận diện cử chỉ ngôn ngữ ký hiệu tự động qua camera
- Đánh giá và phản hồi tức thì cho người học
- Cung cấp lộ trình học từ cơ bản đến nâng cao
- Hoàn toàn miễn phí và có thể tự học
- **Hỗ trợ trẻ em khiếm thính học Tiếng Việt**: Hệ thống cung cấp môi trường học tập tương tác giúp trẻ em khiếm thính tiếp cận và học Tiếng Việt thông qua ngôn ngữ ký hiệu, xây dựng nền tảng ngôn ngữ vững chắc cho sự phát triển toàn diện

### Cấp độ học tập

- **Newbie**: Chữ cái A-Z và số 0-9 (static signs)
- **Basic**: Từ vựng đơn giản (dynamic signs)
- **Advanced**: Câu giao tiếp phức tạp (sequence recognition)

---

## Công nghệ AI nhận diện

### 1. Hand Tracking với MediaPipe

**MediaPipe Hands** là giải pháp hand tracking của Google, cung cấp:
- Phát hiện và theo dõi **21 landmarks** trên mỗi bàn tay
- Hoạt động real-time với độ chính xác cao
- Hỗ trợ nhận diện **2 tay đồng thời**
- Cross-platform (Web, Mobile, Desktop)

**Landmarks extraction**:
```
Mỗi bàn tay: 21 điểm × 3 tọa độ (x, y, z) = 63 features
Hai bàn tay: 63 × 2 = 126 features cho mỗi frame
```

### 2. Kiến trúc Model nhận diện

Hệ thống sử dụng **2 phương pháp nhận diện** tùy theo độ phức tạp:

#### 2.1. Real-time Recognition (Newbie/Basic)

**Đối tượng**: Chữ cái, số, từ vựng đơn giản

**Pipeline**:
```
Camera → MediaPipe → Landmarks → ML Classifier → Prediction
```

**Model**: Random Forest / SVM
- Input: 126 features (hand landmarks)
- Output: Class label (A-Z, 0-9, simple words)
- Latency: < 50ms
- Accuracy: ~95%

**Đặc điểm**:
- Nhận diện **frame-by-frame** (real-time)
- Không cần thu thập sequence
- Phù hợp với static/simple dynamic signs

#### 2.2. Sequence Recognition (Advanced)

**Đối tượng**: Câu giao tiếp, cụm từ phức tạp

**Pipeline**:
```
Camera → MediaPipe → Sequence Buffer (60 frames) → LSTM Model → Prediction
```

**Model**: LSTM/GRU Neural Network
- Input: Sequence of 60 frames × 126 features
- Hidden layers: LSTM với 128-256 units
- Output: Sentence label với confidence score
- Latency: ~500ms (sau khi thu đủ 60 frames)
- Accuracy: ~85-90%

**Đặc điểm**:
- Nhận diện **chuỗi hành động** theo thời gian
- Capture temporal dependencies
- State machine để quản lý việc thu thập frames

### 3. Quy trình nhận diện Sequence

```
┌─────────────────────────────────────────────────────┐
│ STATE MACHINE                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [IDLE] ──── Hand Detected (5 frames) ───→ [RECORDING]
│     ▲                                           │
│     │                                           │
│     │                                           ▼
│     │                                    Collect 60 frames
│     │                                           │
│     │                                           ▼
│  [WAIT_ABSENCE] ◄──── Predict ──── [PREDICTING]
│     │
│     └── No Hand (10 frames) ──→ Reset to IDLE
│
└─────────────────────────────────────────────────────┘
```

**Chi tiết các bước**:

1. **IDLE**: Chờ người dùng đưa tay vào khung hình
   - Yêu cầu: Phát hiện tay liên tục trong 5 frames
   - Mục đích: Tránh false positive

2. **RECORDING**: Thu thập landmarks
   - Thu đúng **60 frames** (2 giây ở 30 FPS)
   - Lưu landmarks của cả 2 tay
   - Hiển thị progress bar

3. **PREDICTING**: Gửi sequence đến LSTM model
   - Input: Tensor shape (60, 126)
   - Model inference: ~300-500ms
   - Output: Label + confidence score

4. **WAIT_ABSENCE**: Chờ người dùng hạ tay
   - Yêu cầu: Không phát hiện tay trong 10 frames
   - Reset về IDLE để nhận diện câu tiếp theo

### 4. Training Pipeline

**Dataset**:
- Thu thập video từ người ký hiệu thực tế
- Sử dụng MediaPipe để extract landmarks
- Augmentation: Rotation, scaling, noise injection

**Model Training**:
```python
# Simplified architecture
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(60, 126)),
    Dropout(0.2),
    LSTM(128, return_sequences=False),
    Dropout(0.2),
    Dense(64, activation='relu'),
    Dense(num_classes, activation='softmax')
])

# Compile
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

**Hyperparameters**:
- Batch size: 32
- Epochs: 50-100
- Learning rate: 0.001
- Optimizer: Adam

### 5. Optimization Techniques

**Performance**:
- **Frame throttling**: Giới hạn 30 FPS để giảm overhead
- **Client-side processing**: MediaPipe chạy trên browser
- **Server-side inference**: LSTM model chạy trên Python backend

**Accuracy Improvement**:
- **Data augmentation**: Tăng đa dạng dataset
- **Ensemble methods**: Kết hợp nhiều models
- **Confidence threshold**: Chỉ chấp nhận prediction > 70%

### 6. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Sự khác biệt giữa các người ký | Normalize landmarks về tọa độ tương đối |
| Lighting conditions | MediaPipe tự động xử lý |
| Tốc độ ký khác nhau | Dynamic Time Warping hoặc padding |
| Các cử chỉ tương tự nhau | Tăng kích thước dataset, fine-tune model |
| Real-time performance | Model compression, quantization |

---

## Tính năng

### Học tập
- Video hướng dẫn từng bước (GIF format)
- Lộ trình học có cấu trúc 3 cấp độ
- Theo dõi tiến độ học tập

### Luyện tập với AI
- **Practice Mode**: Luyện tập real-time với phản hồi tức thì
- **AI Feedback**: Hệ thống tự động đánh giá đúng/sai
- **Scoring System**: Tính điểm dựa trên độ chính xác
- **Adaptive Difficulty**: Tự động điều chỉnh độ khó

### Kiểm tra năng lực
- Practice tests với nhiều dạng bài
- Đánh giá tổng hợp kỹ năng
- Báo cáo chi tiết kết quả

---

## Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Camera Capture (Browser)                         │  │
│  │  └─> MediaPipe Hands (Client-side)                │  │
│  │      └─> Extract 21×2 Landmarks                   │  │
│  └────────────────┬───────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────────────┐
│  BACKEND API    │   │   VSL MODEL (Python)    │
│   (NestJS)      │   │                         │
│                 │   │  ┌───────────────────┐  │
│ - Auth (JWT)    │   │  │ Random Forest/SVM │  │
│ - User Mgmt     │   │  │  (Real-time)      │  │
│ - Lessons       │   │  └───────────────────┘  │
│ - Progress      │   │                         │
│ - Scoring       │   │  ┌───────────────────┐  │
│                 │   │  │   LSTM/GRU        │  │
└────────┬────────┘   │  │  (Sequence)       │  │
         │            │  └───────────────────┘  │
         ▼            └─────────────────────────┘
┌─────────────────┐
│   MongoDB       │
│                 │
│ - Users         │
│ - Lessons       │
│ - Progress      │
│ - Scores        │
└─────────────────┘
```

### Data Flow

**Real-time Recognition** (Newbie/Basic):
```
1. User performs sign
2. MediaPipe extracts landmarks (client)
3. Send landmarks to Python API
4. ML classifier predicts → Return label
5. Frontend shows feedback
```

**Sequence Recognition** (Advanced):
```
1. User performs sign sequence
2. MediaPipe extracts landmarks (client)
3. Collect 60 frames in buffer
4. Send sequence to Python API
5. LSTM model predicts → Return label + confidence
6. Frontend shows feedback
```

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **MediaPipe (Web)** - Hand tracking in browser

### Backend
- **NestJS** - Node.js framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Supabase** - Media storage

### AI/ML
- **Python 3.8+** - Programming language
- **TensorFlow/Keras** - Deep learning framework
- **scikit-learn** - Traditional ML algorithms
- **MediaPipe** - Hand landmark detection
- **OpenCV** - Computer vision utilities
- **Flask/FastAPI** - Python API server

### Model Architecture
- **LSTM** - Long Short-Term Memory networks
- **Random Forest** - Ensemble learning
- **SVM** - Support Vector Machines

---

## Performance Metrics

| Metric | Newbie/Basic | Advanced |
|--------|-------------|----------|
| Accuracy | ~95% | ~85-90% |
| Latency | < 50ms | ~500ms |
| FPS | 30 | 30 |
| Model Size | ~5MB | ~50MB |

---

## Quick Start

### Requirements
- Node.js 18+
- Python 3.8+
- MongoDB
- Webcam

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/LearnBySign.git
cd LearnBySign

# Setup Backend
cd back_end
npm install
npm run start:dev

# Setup Frontend
cd front_end
npm install  
npm run dev

# Setup VSL Model
cd back_end/vsl_model
pip install -r requirements.txt
python main.py
```

Access at: `http://localhost:3000`

---

### Areas for Improvement
- **Dataset expansion**: Thêm nhiều mẫu ký hiệu từ người dùng thực
- **Model optimization**: Cải thiện accuracy và giảm latency
- **New features**: Thêm các cấp độ học mới, game hóa
- **Localization**: Hỗ trợ nhiều ngôn ngữ ký hiệu khác

---

## License

Dự án được phân phối dưới giấy phép MIT License.

---

## Credits

**Dự án được phát triển bởi sinh viên Đại học Công nghệ - ĐHQGHN**  
Môn học: **Tương tác Người - Máy**

### Thành viên dự án

| MSSV | Họ và tên |
|------|-----------|
| 23021599 | Trần Gia Khánh | 
| 23021591 | Nguyễn Xuân Kiên | 
| 23021734 | Nguyễn Thị Thương |
| 23021747 | Vũ Nhật Tuồng Văn |

### Acknowledgments
- [MediaPipe](https://mediapipe.dev/) - Google's hand tracking solution
- [TensorFlow](https://tensorflow.org/) - Deep learning framework
- Cộng đồng điếc Việt Nam - Góp ý về ngôn ngữ ký hiệu

---

## Contact

- **GitHub**: [LearnBySign Repository](https://github.com/your-repo/LearnBySign)
- **Issues**: [Report bugs or request features](https://github.com/your-repo/LearnBySign/issues)

