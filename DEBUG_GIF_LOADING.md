# Debug: GIF Loading Issues

## Vấn đề
GIF files không load được với error 404, đặc biệt với filenames có:
- Dấu cách (space)
- Ký tự Unicode (ô, à, ă, etc.)

## Các bước debug

### 1. Kiểm tra file tồn tại
```bash
cd gif_stage\02_Simple_Words\gifs
dir "ông bà.gif"
```

Kết quả mong đợi: File phải tồn tại

### 2. Test backend serve file
```bash
# Windows CMD
curl "http://localhost:3001/media/02_Simple_Words/gifs/ông bà.gif"

# Hoặc với PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/media/02_Simple_Words/gifs/ông bà.gif"

# Test với URL encoded space
curl "http://localhost:3001/media/02_Simple_Words/gifs/ông%20bà.gif"
```

Kết quả mong đợi: Trả về nội dung GIF (binary data)

### 3. Kiểm tra URL trong database
```bash
mongosh mongodb://localhost:27017/learnbysign

# Xem lesson b1
db.lessons.findOne({ customId: 'b1' })

# Check contents[0].videoUrl
db.lessons.findOne({ customId: 'b1' }).contents[0]
```

URL nên có dạng: `http://localhost:3001/media/02_Simple_Words/gifs/ông%20bà.gif`

### 4. Test trực tiếp trong browser
Mở browser và paste:
```
http://localhost:3001/media/02_Simple_Words/gifs/bạn.gif
http://localhost:3001/media/02_Simple_Words/gifs/ông%20bà.gif
```

Nếu hiện GIF → backend OK
Nếu 404 → backend config sai

## Giải pháp

### Option 1: Đổi tên file (recommended)
Đổi tên file GIF để không có dấu cách và Unicode:
```
ông bà.gif → ong_ba.gif
bạn.gif → ban.gif
```

Sau đó update lại script seed để match với tên file mới.

### Option 2: Fix encoding trong backend
Đã update `main.ts` để dùng `express.static` trực tiếp với proper headers.

Restart backend:
```bash
cd back_end
npm run start:dev
```

### Option 3: Rename files với script
Tạo script tự động rename:
```javascript
// scripts/rename-gifs.js
const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '_'); // Replace spaces with underscore
}

function renameGifs(folder) {
  const gifs = fs.readdirSync(folder).filter(f => f.endsWith('.gif'));
  
  gifs.forEach(file => {
    const newName = slugify(file.replace('.gif', '')) + '.gif';
    if (file !== newName) {
      fs.renameSync(
        path.join(folder, file),
        path.join(folder, newName)
      );
      console.log(`Renamed: ${file} → ${newName}`);
    }
  });
}

// Run
renameGifs(path.join(__dirname, '../gif_stage/02_Simple_Words/gifs'));
renameGifs(path.join(__dirname, '../gif_stage/03_Complex_Words/gifs'));
renameGifs(path.join(__dirname, '../gif_stage/04_Advanced/gifs'));
```

## Kiểm tra sau khi fix

1. Restart backend
2. Chạy lại script seed: `node scripts/seed-basic-advanced-lessons.js`
3. Test trong browser: http://localhost:3000/dashboard/basic
4. Click vào lesson b1
5. Click vào card → modal hiện với GIF

Nếu vẫn lỗi, check DevTools Console để xem URL đang gọi là gì.
