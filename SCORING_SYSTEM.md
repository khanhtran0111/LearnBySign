# Hệ thống Điểm số và Streak - LearnBySign

## Tổng quan
Đã implement hoàn chỉnh hệ thống điểm số và theo dõi streak ngày học cho ứng dụng LearnBySign.

## Cơ chế tính điểm

### 1. Điểm Lesson (Lesson Points)
- **Công thức**: `Số câu hỏi trong lesson × 10 điểm`
- **Ví dụ**: 
  - Bài học có 8 chữ cái → 8 × 10 = 80 điểm
  - Bài học có 10 số → 10 × 10 = 100 điểm
- **Áp dụng cho**: Tất cả các cấp độ (Newbie, Basic, Advanced)

### 2. Điểm Practice (Practice Points)
- **Công thức**: `Số câu trả lời đúng × 15 điểm`
- **Ví dụ**:
  - Trả lời đúng 5 câu → 5 × 15 = 75 điểm
  - Trả lời đúng 10 câu → 10 × 15 = 150 điểm
- **Áp dụng cho**: Tất cả các bài luyện tập

### 3. Streak (Chuỗi ngày học)
- **Quy tắc**:
  - Học liên tục mỗi ngày → Streak +1
  - Bỏ qua 1 ngày → Streak reset về 1
  - Học nhiều lần trong cùng 1 ngày → Streak không thay đổi
- **Cập nhật**: Tự động khi hoàn thành bất kỳ lesson hoặc practice nào

## Thay đổi Database

### 1. User Schema (`user.schema.ts`)
Đã thêm các trường mới:
```typescript
lessonPoints: number;      // Tổng điểm từ lessons
practicePoints: number;    // Tổng điểm từ practices
currentStreak: number;     // Chuỗi ngày học hiện tại
lastStudyDate: Date;       // Ngày học gần nhất
```

### 2. Progress Schema (`progress.schema.ts`)
Đã thêm các trường mới:
```typescript
type: 'lesson' | 'practice';  // Loại bài học
questionCount: number;         // Số câu hỏi trong lesson
correctAnswers: number;        // Số câu trả lời đúng trong practice
```

### 3. Lesson Schema (`lesson.schema.ts`)
Đã thêm các trường mới:
```typescript
type: 'lesson' | 'practice';  // Loại bài học
questionCount: number;         // Số câu hỏi
```

## API Endpoints

### 1. Mark Progress
**POST** `/progress/mark`

Request body:
```json
{
  "idUser": "user_mongodb_id",
  "idLesson": "lesson_mongodb_id",
  "type": "lesson",           // hoặc "practice"
  "completed": true,
  "questionCount": 8,         // Cho lesson
  "correctAnswers": 10        // Cho practice
}
```

Response:
- Tự động tính điểm dựa trên type
- Tự động cập nhật user's lessonPoints/practicePoints
- Tự động cập nhật streak

### 2. Get User Stats
**GET** `/users/me/stats`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "level": "newbie",
  "lessonPoints": 240,
  "practicePoints": 180,
  "totalPoints": 420,
  "currentStreak": 7,
  "lastStudyDate": "2025-11-26T00:00:00.000Z",
  "lessonsCompleted": 12
}
```

## Frontend Integration

### 1. Lesson Page
- Khi bấm "Hoàn thành", gọi API mark progress với:
  - `type: 'lesson'`
  - `questionCount`: số chữ cái/số trong bài
  - `completed: true`
- Hiển thị thông báo số điểm nhận được

### 2. Practice Page
- Khi hoàn thành bài practice, gọi API mark progress với:
  - `type: 'practice'`
  - `correctAnswers`: số câu trả lời đúng
  - `completed: true`
- Hiển thị thông báo số điểm nhận được

### 3. Profile Page
Hiển thị đầy đủ thông tin:
- **Điểm Lesson**: Tổng điểm từ các bài học
- **Điểm Practice**: Tổng điểm từ bài luyện tập
- **Tổng điểm**: Lesson + Practice
- **Streak**: Số ngày học liên tục
- **Ngày học gần nhất**: Hiển thị ngày
- **Cấp độ hiện tại**: Newbie/Basic/Advanced
- **Số bài hoàn thành**: Thống kê tổng quan

## Dashboard
- Hiển thị streak hiện tại
- Cập nhật real-time khi hoàn thành bài học

## Lưu ý quan trọng

### 1. Migration Database
Sau khi deploy code mới, cần chạy migration để thêm các field mới cho user hiện có:
```javascript
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

### 2. Lesson/Practice ID Mapping
- Frontend đang dùng ID string (`n1`, `p1`, etc.)
- Backend cần MongoDB ObjectId thực tế
- Cần tạo mapping hoặc seed data với ID phù hợp

### 3. Testing
Kiểm tra các trường hợp:
- Học lần đầu (streak = 1)
- Học liên tục nhiều ngày (streak tăng)
- Bỏ qua 1 ngày (streak reset)
- Học nhiều bài trong 1 ngày (streak không đổi)
- Tính điểm lesson chính xác
- Tính điểm practice chính xác

## Cách sử dụng

1. **Đăng nhập** vào ứng dụng
2. **Học lesson**: 
   - Chọn bài học
   - Xem nội dung
   - Bấm "Hoàn thành"
   - Nhận điểm = số chữ cái × 10
3. **Làm practice**:
   - Chọn bài luyện tập
   - Trả lời các câu hỏi
   - Hoàn thành
   - Nhận điểm = số câu đúng × 15
4. **Xem profile**:
   - Bấm avatar → "Xem hồ sơ"
   - Xem tất cả thống kê chi tiết

## Tính năng tương lai có thể thêm

- Leaderboard (bảng xếp hạng)
- Badges/Achievements (huy hiệu thành tích)
- Daily challenges (thử thách hàng ngày)
- Streak rewards (phần thưởng streak)
- Level progression (thăng cấp tự động)
