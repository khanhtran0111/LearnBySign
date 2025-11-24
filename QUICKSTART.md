# 🚀 Quick Start Guide

## ⚡ Cách chạy nhanh (Tự động load Python + NestJS)

### Bước 1: Cài đặt dependencies

```bash
# Backend (NestJS + Python packages)
cd back_end
npm install
npm install --save-dev concurrently
cd vsl_model
pip install -r requirements.txt
cd ..

# Frontend (NextJS)
cd ..\front_end
npm install
```

### Bước 2: Kiểm tra Model File

```bash
dir back_end\vsl_model\asl_landmarks_best.joblib
```

✅ **Nếu file tồn tại** → Tiếp tục bước 3
❌ **Nếu chưa có** → Train model trước (xem cam.py)

### Bước 3: Setup môi trường Backend

```bash
cd back_end
copy .env.example .env
```

### Bước 4: Chạy Backend (Tự động start Python + NestJS)

```bash
cd back_end
npm run start:dev
```

**Output sẽ thấy:**
```
[PYTHON] ✓ Model loaded successfully!
[PYTHON] ✓ Available classes: ['A', 'B', 'C', 'D', 'E']
[PYTHON] Uvicorn running on http://0.0.0.0:8000
[NESTJS] NestJS application successfully started
```

### Bước 5: Chạy Frontend (Terminal mới)

```bash
cd front_end
npm run dev
```

### Bước 6: Chơi Game! 🎮

Mở browser: `http://localhost:3001`

1. Vào Dashboard
2. Chọn level (Newbie/Basic/Advanced)
3. Scroll xuống → Click **"Chơi ngay"** ở phần Game Nhận Diện Cử Chỉ
4. Click "Bật camera" → Cho phép camera access
5. Thực hiện cử chỉ A-E theo yêu cầu
6. Hoàn thành 10 cử chỉ trong 2 phút!

---

## ✅ Kiểm tra hệ thống

### Backend OK?
Vào `http://localhost:3000/api/sign/health` - Thấy:
```json
{
  "status": "healthy",
  "classes": ["A", "B", "C", "D", "E"]
}
```

### Frontend OK?
Vào `http://localhost:3001` - Thấy trang chủ LearnBySign

---

## 📝 Lưu ý quan trọng

- ✅ Camera chỉ hoạt động trên **localhost** hoặc **HTTPS**
- ✅ Đảm bảo Python đã cài đặt (Python 3.8+)
- ✅ File model `asl_landmarks_best.joblib` phải tồn tại
- ✅ Khi dừng backend (Ctrl+C), cả Python và NestJS đều sẽ tắt

---

## 🔧 Troubleshooting

### Lỗi "Model file not found"
→ Chạy script train model hoặc copy file model vào `back_end/vsl_model/`

### Python không start
→ Kiểm tra Python đã cài: `python --version`
→ Cài lại dependencies: `pip install -r requirements.txt`

### NestJS không connect được Python
→ Đợi Python khởi động xong (5-10 giây) rồi refresh trang

### Camera không hoạt động
→ Kiểm tra browser có quyền truy cập camera
→ Chỉ chạy trên localhost hoặc HTTPS
