# 🔧 FIX: GIF Loading & Seed Lessons

## ✅ Đã Fix

1. **Đọc trực tiếp GIF từ folder** - Không dùng keywords matching
2. **Chia đều GIF** cho các lesson
3. **URL encoding đơn giản** - Chỉ encode dấu cách
4. **Test server** để verify static serving

---

## 🚀 Chạy Ngay

### 1. Test Static Serving
```bash
cd back_end
node scripts/test-static-serve.js
```

Mở: http://localhost:3002/list

### 2. Restart Backend
```bash
# Ctrl+C để stop test server
npm run start:dev
```

### 3. Seed Lại Database (BẮT BUỘC!)
```bash
# Terminal mới
cd back_end
node scripts/seed-basic-advanced-lessons.js
```

### 4. Test Frontend
```bash
cd front_end
npm run dev
```

Vào: http://localhost:3000/dashboard/basic

---

## 📋 Cấu Trúc Mới

**Basic (6 lessons):**
- b1: 10 GIF từ `02_Simple_Words`
- b2: 10 GIF từ `02_Simple_Words`
- b3: 1/3 từ `04_Advanced`
- b4: 10 GIF từ `03_Complex_Words`
- b5: 1/3 từ `04_Advanced`
- b6: 1/3 từ `04_Advanced`

**Advanced (1 lesson):**
- a1: 30 GIF đầu từ `04_Advanced`

---

## 🐛 Debug

### Lỗi: GIF không load

**Check 1: Backend serve file**
```bash
# Test trực tiếp
curl http://localhost:3001/media/02_Simple_Words/gifs/bạn.gif

# Hoặc browser
http://localhost:3001/media/02_Simple_Words/gifs/bạn.gif
```

**Check 2: Database contents**
```bash
mongosh mongodb://localhost:27017/learnbysign
db.lessons.findOne({ customId: 'b1' })
```

Xem `contents[0].videoUrl` phải có format:
```
http://localhost:3001/media/02_Simple_Words/gifs/...
```

**Check 3: DevTools**
- F12 > Network
- Click vào lesson
- Xem request URL nào bị 404

### Lỗi: Nội dung bài học sai

→ Chạy lại: `node scripts/seed-basic-advanced-lessons.js`

Script mới sẽ:
- Đọc tất cả GIF files
- Chia đều cho các lesson
- Không dựa vào keywords nữa

---

## 📝 Files Đã Sửa

✅ `back_end/scripts/seed-basic-advanced-lessons.js` - Logic seed mới  
✅ `back_end/scripts/test-static-serve.js` - NEW: Test server  
✅ `back_end/src/main.ts` - Static file serving  
✅ `front_end/app/dashboard/lesson/[slug]/page.tsx` - Error handling
