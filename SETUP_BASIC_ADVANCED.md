# Hướng dẫn Setup Lessons Basic & Advanced (Local - Không dùng Supabase)

## Bước 1: Chuẩn bị GIF files (đã có sẵn trong gif_stage/)

GIF files đã có sẵn trong project tại:
- `gif_stage/01_Alphabet_Numbers/gifs/` - Chữ cái và số (cho Newbie)
- `gif_stage/02_Simple_Words/gifs/` - Từ đơn giản (cho Basic)
- `gif_stage/03_Complex_Words/gifs/` - Từ phức tạp (cho Basic)
- `gif_stage/04_Advanced/gifs/` - Cụm từ nâng cao (cho Advanced)

**Backend sẽ serve static files từ folder `gif_stage/` qua endpoint `/media/`**

Ví dụ URLs:
- `http://localhost:3001/media/01_Alphabet_Numbers/gifs/a.gif`
- `http://localhost:3001/media/02_Simple_Words/gifs/bạn.gif`
- `http://localhost:3001/media/04_Advanced/gifs/xin%20chào.gif`

---

## Bước 2: Start Backend với Static File Serving

### 2.1. Start Backend
```bash
cd back_end
npm run start:dev
```

Backend sẽ serve static files từ `gif_stage/` qua `/media/` endpoint.

### 2.2. Seed Lessons vào MongoDB
```bash
# Terminal mới
cd back_end
node scripts/seed-basic-advanced-lessons.js
```

**Kết quả mong đợi:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📚 Found 8 GIFs in stage 02
📚 Found 1 GIFs in stage 03  
📚 Found 500+ GIFs in stage 04

🗑️  Cleared existing Basic and Advanced lessons
✅ Seeded 10 new lessons (Basic + Advanced)

📋 Lesson Summary:
  b1 - Bài 1: Người thân, gia đình (15 items)
  b2 - Bài 2: Ẩm thực (40 items)
  p5 - Luyện tập: Gia đình & Ẩm thực (0 items)
  b3 - Bài 3: Các quốc gia trên thế giới (20 items)
  b4 - Bài 4: Động vật (10 items)
  p6 - Luyện tập: Quốc gia & Động vật (0 items)
  b5 - Bài 5: Phương tiện (7 items)
  b6 - Bài 6: Hành động (35 items)
  p7 - Luyện tập: Phương tiện & Hành động (0 items)
  a1 - Bài 1: Các câu nói cơ bản và nâng cao (30 items)
  p8 - Luyện tập: Giao tiếp nâng cao (0 items)

✅ Done!
```

### 2.3. Kiểm tra MongoDB
```bash
# Kết nối MongoDB
mongosh mongodb://localhost:27017/learnbysign

# Xem lessons
db.lessons.find({ difficulty: 'basic' }).pretty()
db.lessons.find({ difficulty: 'advanced' }).pretty()
```

### 2.4. Test GIF URLs
Mở browser và test:
- http://localhost:3001/media/02_Simple_Words/gifs/bạn.gif
- http://localhost:3001/media/04_Advanced/gifs/xin%20chào.gif

---

## Bước 3: Test Frontend

### 3.1. Restart Frontend
```bash
cd front_end
npm run dev
```

### 3.2. Kiểm tra Dashboard với URLs mới
1. Login vào app
2. Vào Dashboard → tự động redirect sang **http://localhost:3000/dashboard/newbie**
3. Click level khác:
   - Click **Basic** → navigate sang **http://localhost:3000/dashboard/basic**
   - Click **Advanced** → navigate sang **http://localhost:3000/dashboard/advanced**
4. Kiểm tra:
   - ✅ URL thay đổi khi chuyển level
   - ✅ Hiển thị đúng 6 lessons + 3 practices cho Basic
   - ✅ Hiển thị đúng 1 lesson + 1 practice cho Advanced
   - ✅ Click vào lesson, modal hiện đúng contents với GIF từ local
   - ✅ Logic unlock: bài tiếp theo unlock sau khi hoàn thành bài trước

### 3.3. Test Lesson Flow
1. Click vào **b1 - Người thân, gia đình**
2. Kiểm tra:
   - ✅ Grid cards hiển thị các từ: "ông bà", "em họ", "cháu họ", "bạn"...
   - ✅ Click vào card, modal hiển thị GIF
   - ✅ Button Next/Prev navigate giữa các contents
   - ✅ Button "Hoàn thành" save progress
3. Sau khi hoàn thành b1, kiểm tra:
   - ✅ b2 tự động unlock
   - ✅ Stats cập nhật (Tiến độ chung, Đã hoàn thành)
   - ✅ Sidebar hiển thị Basic: 1/6

---

## Bước 4: Điều chỉnh (nếu cần)

### 4.1. Nếu thiếu GIF
- Kiểm tra file CSV trong `gif_stage/*/text/labels.csv`
- Thêm/bớt keywords trong `basicCategories` (file seed script)
- Chạy lại script seed

### 4.2. Nếu muốn thay đổi phân loại
- Sửa `basicCategories` trong `seed-basic-advanced-lessons.js`
- Thêm/bớt keywords cho mỗi category
- Chạy lại script: `node scripts/seed-basic-advanced-lessons.js`

### 4.3. Nếu Practice không hoạt động
- Practice lessons (p5, p6, p7, p8) cần dùng AI model
- Backend cần endpoint `/sign-recognition/practice/:practiceId`
- Xem file `PracticeMode.tsx` để implement logic practice

---

## Cấu trúc Lessons mới

### Basic Level (6 lessons + 3 practices)
```
Nhóm 1: Gia đình & Ẩm thực
├─ b1: Người thân, gia đình (15 từ)
├─ b2: Ẩm thực (40 từ)
└─ p5: Practice (Gia đình & Ẩm thực)

Nhóm 2: Quốc gia & Động vật  
├─ b3: Các quốc gia (20 từ)
├─ b4: Động vật (10 từ)
└─ p6: Practice (Quốc gia & Động vật)

Nhóm 3: Phương tiện & Hành động
├─ b5: Phương tiện (7 từ)
├─ b6: Hành động (35 từ)
└─ p7: Practice (Phương tiện & Hành động)
```

### Advanced Level (1 lesson + 1 practice)
```
Giao tiếp nâng cao
├─ a1: Các câu nói cơ bản và nâng cao (30 câu)
└─ p8: Practice (Giao tiếp nâng cao)
```

---

## Troubleshooting

### Lỗi: "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
- Tắt AdBlock/uBlock Origin
- Check backend đang chạy ở port 3001
- Test URL trực tiếp: http://localhost:3001/media/02_Simple_Words/gifs/bạn.gif

### Lỗi: "Cannot find module"
- Chạy: `npm install` trong folder back_end
- Đảm bảo file `.env` có `MONGODB_URI`

### Lessons không hiển thị contents
- Check MongoDB: `db.lessons.find({ customId: 'b1' })`
- Đảm bảo field `contents` không empty
- Xem logs trong DevTools Console

### Progress không cập nhật
- Check localStorage: `localStorage.getItem('accessToken')`
- Check API call: DevTools > Network > `/progress/mark`
- Xem logs trong Console: `[DashboardPage] Stats calculated`

---

## Files đã thay đổi

### Backend:
1. **`back_end/src/main.ts`** (UPDATED)
   - Thêm `useStaticAssets()` để serve GIF từ `gif_stage/` qua `/media/`

2. **`back_end/scripts/seed-basic-advanced-lessons.js`** (NEW)
   - Script seed lessons với local URLs: `http://localhost:3001/media/...`

### Frontend:
1. **`front_end/app/dashboard/page.tsx`** (UPDATED)
   - Redirect sang `/dashboard/newbie` khi vào `/dashboard`

2. **`front_end/app/dashboard/newbie/page.tsx`** (NEW)
   - Route mới cho Newbie level

3. **`front_end/app/dashboard/basic/page.tsx`** (NEW)
   - Route mới cho Basic level

4. **`front_end/app/dashboard/advanced/page.tsx`** (NEW)
   - Route mới cho Advanced level

5. **`front_end/app/data/lessonsData.ts`** (UPDATED)
   - Cập nhật metadata cho Basic và Advanced lessons

6. **`front_end/app/components/DashboardPage.tsx`** (UPDATED)
   - Thêm `defaultLevel` prop
   - Thêm `handleLevelChange()` để navigate sang URL mới
   - Cập nhật slug mapping cho b5, b6, a1, p5-p8

### Không cần upload gì cả:
- ✅ GIF files đã có sẵn trong `gif_stage/`
- ✅ Backend tự serve static files
