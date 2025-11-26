# Hướng dẫn Setup Database và Sửa lỗi

## Vấn đề hiện tại

1. **Dashboard hiển thị streak cứng "7 ngày"** ✅ ĐÃ SỬA
2. **Profile không cập nhật điểm sau khi học** - Do chưa seed lessons vào DB
3. **Lesson/Practice completion không lưu được** - Do frontend dùng ID string (n1, p1) nhưng backend cần MongoDB ObjectId

## Giải pháp

### Bước 1: Seed Lessons vào Database

```bash
cd back_end
node scripts/seed-lessons.js
```

Script này sẽ:
- Tạo tất cả lessons với customId (n1, n2, p1, p2, etc.)
- Map mỗi customId với MongoDB ObjectId thực
- In ra bảng mapping để reference

### Bước 2: Cập nhật User fields trong DB

Chạy MongoDB command để thêm fields mới cho users:

```javascript
// Kết nối MongoDB shell hoặc dùng MongoDB Compass
use learnbysign

// Cập nhật tất cả users
db.user.updateMany(
  {},
  {
    $set: {
      lessonPoints: 0,
      practicePoints: 0,
      currentStreak: 0,
      lastStudyDate: null
    }
  }
)
```

### Bước 3: Restart Backend Server

```bash
cd back_end
npm run start:dev
```

### Bước 4: Test Flow

1. **Đăng nhập** vào ứng dụng
2. **Vào Dashboard** - Kiểm tra:
   - Streak hiển thị "0 ngày" (chưa học)
   - Stats cards hiển thị đúng
3. **Học 1 lesson**:
   - Chọn bài "Bài 1: Chữ cái A-H"
   - Xem nội dung
   - Bấm "Hoàn thành"
   - Alert hiển thị: "Chúc mừng! Bạn đã hoàn thành bài học và nhận được 80 điểm!"
4. **Kiểm tra Dashboard**:
   - Refresh trang
   - Streak = 1 ngày
5. **Vào Profile**:
   - Điểm Lesson = 80
   - Điểm Practice = 0
   - Streak = 1
6. **Làm 1 practice**:
   - Chọn "Ghép chữ cái A-H"
   - Hoàn thành với 5 câu đúng
   - Nhận 75 điểm (5 × 15)
7. **Kiểm tra Profile lại**:
   - Điểm Lesson = 80
   - Điểm Practice = 75
   - Tổng điểm = 155
   - Streak vẫn = 1 (cùng ngày)

## Các thay đổi đã thực hiện

### Backend

1. **User Schema** - Thêm fields:
   ```typescript
   lessonPoints: number
   practicePoints: number
   currentStreak: number
   lastStudyDate: Date
   ```

2. **Lesson Schema** - Thêm:
   ```typescript
   customId: string (unique)
   type: 'lesson' | 'practice'
   questionCount: number
   ```

3. **Progress Schema** - Thêm:
   ```typescript
   type: 'lesson' | 'practice'
   questionCount: number
   correctAnswers: number
   ```

4. **API Endpoints mới**:
   - `GET /lessons/by-custom-id/:customId` - Lấy lesson bằng customId
   - `GET /users/me/stats` - Lấy thống kê user

5. **Progress Service** - Logic tính điểm và streak:
   - Lesson: questionCount × 10
   - Practice: correctAnswers × 15
   - Streak: Auto update based on lastStudyDate

### Frontend

1. **DashboardPage.tsx**:
   - Fetch userStats từ API
   - Truyền userStats vào DashboardContent

2. **DashboardContent.tsx**:
   - Nhận userStats prop
   - Hiển thị streak thực từ API

3. **Lesson Page**:
   - Gọi `/lessons/by-custom-id/n1` để lấy ObjectId
   - Dùng ObjectId thực khi mark progress

4. **Practice Page**:
   - Tương tự lesson page
   - Gọi API với ObjectId thực

## Debug

Nếu vẫn có lỗi:

### 1. Check Backend Logs
```bash
cd back_end
npm run start:dev
# Xem console logs
```

### 2. Check API Response
Mở Browser DevTools → Network tab:
- Xem response của `/users/me/stats`
- Xem response của `/progress/mark`
- Check for errors

### 3. Check MongoDB
```bash
# Kết nối MongoDB
mongosh "mongodb://localhost:27017/learnbysign"

# Kiểm tra lessons
db.lessons.find({ customId: "n1" })

# Kiểm tra user
db.user.findOne({ email: "your@email.com" })

# Kiểm tra progress
db.progress.find({ idUser: ObjectId("...") })
```

### 4. Reset Data (nếu cần)
```javascript
// Xóa tất cả progress
db.progress.deleteMany({})

// Reset user points
db.user.updateOne(
  { email: "your@email.com" },
  {
    $set: {
      lessonPoints: 0,
      practicePoints: 0,
      currentStreak: 0,
      lastStudyDate: null
    }
  }
)
```

## Lưu ý quan trọng

1. **Phải seed lessons trước** - Không có lessons trong DB thì không lưu được progress
2. **customId phải unique** - Mỗi lesson phải có customId riêng (n1, n2, p1, etc.)
3. **Streak chỉ tăng khi học khác ngày** - Học nhiều bài cùng ngày không tăng streak
4. **Points tích lũy** - Không reset, chỉ cộng dồn

## Flow hoàn chỉnh

```
User học lesson
  → Frontend: Lấy customId (n1)
  → API: GET /lessons/by-custom-id/n1 → ObjectId
  → API: POST /progress/mark { idUser, idLesson: ObjectId, type: 'lesson', questionCount: 8 }
  → Backend: Tính điểm = 8 × 10 = 80
  → Backend: Cập nhật user.lessonPoints += 80
  → Backend: Cập nhật streak nếu ngày khác
  → Database: Lưu progress record
  → Frontend: Refresh → Hiển thị điểm mới
```
