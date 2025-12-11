// Script to seed Basic and Advanced lessons into MongoDB
// Run: node scripts/seed-basic-advanced-lessons.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['newbie', 'basic', 'advanced'], default: 'newbie' },
  type: { type: String, enum: ['lesson', 'practice'], default: 'lesson' },
  questionCount: { type: Number, default: 1 },
  mediaUrl: String,
  folder: String,
  customId: String,
  contents: [{ 
    label: String,
    description: String,
    videoUrl: String,
    thumbnailUrl: String,
    order: Number
  }]
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema, 'lessons');

// Phân loại từ theo category từ file CSV và GIF
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const MEDIA_BASE_URL = `${BACKEND_URL}/media`;

// Cấu hình Basic lessons với DANH SÁCH TÊN FILE CỤ THỂ (không dùng substring match)
const basicLessonsConfig = [
  {
    customId: 'b1',
    title: 'Bài 1: Người thân, gia đình',
    description: 'Học từ vựng về người thân trong gia đình',
    // Danh sách CHÍNH XÁC tên file (không có .gif)
    exactFiles: [
      'anh_chi',
      'anh_chi_em',
      'anh_em',
      'anh_hai_anh_ca',
      'anh_ho',
      'anh_re',
      'anh_ruot',
      'anh_vo',
      'chi_hai_chi_ca',
      'chi_ho',
      'chau_ho',
      'em_ho',
      'ong_ba',
      'ban_gai',
      'ban_trai',
      'ban_than',
      'tre_con_con_nit',
      'binh_sua_em_be'
    ]
  },
  {
    customId: 'b2',
    title: 'Bài 2: Ẩm thực',
    description: 'Học từ vựng về đồ ăn, thức uống',
    exactFiles: [
      // Món ăn
      'banh_canh',
      'banh_hamburger',
      'banh_sandwich',
      'banh_trang',
      'bun_cha',
      'bun_dau',
      'bun_mam',
      'bun_ngan',
      'bun_oc',
      'com_rang',
      'my_tom',
      'my_y',
      'my_van_than',
      'bit_tet_bo',
      'vit_quay',
      'ga_nuong_lu',
      'xoi_ga',
      'xoi_gac',
      'chao_suon',
      'goi_nom',
      'sup',
      'sup_do',
      'sup_lo',
      'cho_xoi',
      'lẩu',
      'hap',
      'nuong',
      'xao',
      // Đồ uống
      'tra_da',
      'tra_nong',
      'tra_sua',
      'chanh_da',
      'chanh_muoi',
      'chanh_nong',
      'sinh_to_bo_dau',
      'nuoc_ep_trai_cay',
      'nuoc_ep_cam_ca_chua',
      'nuoc_mam',
      'Cocacola',
      'Socola',
      '7up',
      // Nguyên liệu
      'tuong_ot',
      'rau_diep_ca',
      'rau_ngo_rau_mui',
      'vat_chanh',
      'do_an',
      'do_uong',
      'hai_san',
      'tom_hum'
    ]
  },
  {
    customId: 'b3',
    title: 'Bài 3: Các quốc gia trên thế giới',
    description: 'Học từ vựng về các quốc gia và địa danh',
    exactFiles: [
      'albania_nuoc_albania',
      'anh_nuoc_anh',
      'du_bai_nuoc_du_bai',
      'ma_lai_nuoc_ma_lai_xi_a',
      'ma_cao',
      'mien_dien_nuoc_mi_an_ma',
      'a_rap_nuoc_a_rap',
      'do_thai',
      'phuong_dong',
      'phuong_tay',
      // Địa danh Việt Nam
      'bac_lieu',
      'ba_ria_vung_tau',
      'an_giang',
      'quy_nhon',
      'tuy_hoa',
      'co_do_hue',
      'thang_long',
      'ba_na',
      'cang_hai_phong',
      'cang_sai_gon',
      've_sai_gon',
      'bai_bien_vung_tau',
      'chua_yen_tu',
      'day_nui_hoang_lien_son',
      'dong_bang_song_hong',
      'dong_bang_song_cuu_long',
      'dong_bang_duyen_hai_mien_trung',
      'cau_the_huc_ho_guom',
      'sa_mac',
      'thung_lung'
    ]
  },
  {
    customId: 'b4',
    title: 'Bài 4: Động vật',
    description: 'Học từ vựng về các loài động vật',
    exactFiles: [
      'ca_kiem',
      'con_ca_sau',
      'con_hau',
      'con_vuon',
      'duoi_ca',
      'duoi_chuot',
      'canh_buom',
      'cai_vot_ca',
      'noi_da_ga',
      'rang_ho'
    ]
  },
  {
    customId: 'b5',
    title: 'Bài 5: Phương tiện',
    description: 'Học từ vựng về các phương tiện giao thông',
    exactFiles: [
      'xe_container',
      'hang_may_bay',
      'bay_nhanh_may_bay',
      'may_xuc',
      'bai_do_xe_o_to',
      'internet'
    ]
  },
  {
    customId: 'b6',
    title: 'Bài 6: Hành động',
    description: 'Học từ vựng về các hành động, động từ',
    exactFiles: [
      'danh_cau_long',
      'danh_rang',
      'rua_chan',
      'rua_mat',
      'luoc',
      'luoc_rau',
      'nau_nuong',
      'lau',
      'lau_mieng',
      'moc_rau',
      'moc_ria_mep',
      'moc_toc',
      'cat_long_mui',
      'nho_long_may',
      'nho_rang',
      'nho_rau',
      'nho_toc',
      'trang_diem',
      'di_dao',
      'di_tuan',
      'di_ve_sinh',
      'nhay_bao_bo',
      'nhay_lo_co',
      'chay_dong_vat',
      'ban_chai_danh_rang',
      'vot_cau_long',
      'keo_co',
      'cam_trai',
      'tron_tim',
      'xoa_dau',
      'nham_mat',
      'liec_nhin',
      'ngung_lai',
      'dung_lai',
      'xay_ra',
      'quan_sat',
      'giam_sat',
      'an',
      'an_uong',
      'hoi',
      'hua',
      'luom',
      'xem_da',
      'thi_tham'
    ]
  },
  {
    customId: 'b7',
    title: 'Bài 7: Các từ khác',
    description: 'Học các từ vựng phổ biến khác (chỉ từ đơn/đôi)',
    exactFiles: [] // Sẽ lấy các TỪ ĐƠN/ĐÔI còn lại (1-2 từ ghép)
  }
];

// Practice lessons: lấy contents từ 2 lesson trước đó
const practiceLessonsConfig = [
  {
    customId: 'p5',
    title: 'Practice 5: Ôn tập Người thân & Ẩm thực',
    description: 'Thực hành nhận diện từ vựng từ Bài 1 và Bài 2',
    lessonIds: ['b1', 'b2']
  },
  {
    customId: 'p6',
    title: 'Practice 6: Ôn tập Quốc gia & Động vật',
    description: 'Thực hành nhận diện từ vựng từ Bài 3 và Bài 4',
    lessonIds: ['b3', 'b4']
  },
  {
    customId: 'p7',
    title: 'Practice 7: Ôn tập Phương tiện & Hành động',
    description: 'Thực hành nhận diện từ vựng từ Bài 5 và Bài 6',
    lessonIds: ['b5', 'b6']
  },
  {
    customId: 'p9',
    title: 'Practice 9: Ôn tập Các từ khác',
    description: 'Thực hành nhận diện từ vựng từ Bài 7',
    lessonIds: ['b7']
  }
];

// Đọc tất cả GIF files từ folder
function getAllGifsFromFolder(folderPath) {
  try {
    const gifsPath = path.join(folderPath, 'gifs');
    if (!fs.existsSync(gifsPath)) {
      console.log(`⚠️  Folder not found: ${gifsPath}`);
      return [];
    }
    const files = fs.readdirSync(gifsPath);
    const gifs = files.filter(f => f.endsWith('.gif'));
    console.log(`   Found ${gifs.length} GIF files in ${path.basename(folderPath)}`);
    return gifs; // Giữ nguyên tên file với .gif
  } catch (err) {
    console.log(`⚠️  Error reading folder: ${folderPath}`, err.message);
    return [];
  }
}

// Lọc GIF theo keywords (tìm trong tên file)
function filterGifsByKeywords(allGifs, keywords) {
  return allGifs.filter(gifFile => {
    const fileName = gifFile.toLowerCase();
    return keywords.some(keyword => fileName.includes(keyword.toLowerCase()));
  });
}

// Tạo contents từ danh sách GIF files
function createContentsFromGifs(gifFiles, stageFolder, lessonType = 'lesson') {
  const contents = [];
  
  gifFiles.forEach((gifFile, index) => {
    // gifFile đã có .gif rồi (ví dụ: ban.gif)
    const videoUrl = `${MEDIA_BASE_URL}/${stageFolder}/gifs/${gifFile}`;
    const label = gifFile.replace('.gif', '').replace(/_/g, ' '); // Tên hiển thị
    
    // Chỉ có description "Ký hiệu cho" ở Newbie level
    const description = lessonType === 'newbie' 
      ? `Ký hiệu cho "${label}"`
      : label; // Basic/Advanced chỉ hiện label
    
    contents.push({
      label: label,
      description: description,
      videoUrl: videoUrl,
      order: index + 1
    });
  });

  return contents;
}

const basicLessons = [];
const advancedLessons = [];

const gifStageRoot = path.join(__dirname, '..', '..', 'gif_stage');

console.log('\n📂 Đọc GIF files từ các folder...');

// Đọc GIF files từ TẤT CẢ các folder
const stage02Path = path.join(gifStageRoot, '02_Simple_Words');
const stage03Path = path.join(gifStageRoot, '03_Complex_Words');
const stage04Path = path.join(gifStageRoot, '04_Advanced');

const stage02Gifs = getAllGifsFromFolder(stage02Path);
const stage03Gifs = getAllGifsFromFolder(stage03Path);
const stage04Gifs = getAllGifsFromFolder(stage04Path);

// Gộp tất cả GIF để lọc theo keywords
const allGifs = [
  ...stage02Gifs.map(f => ({ file: f, folder: '02_Simple_Words' })),
  ...stage03Gifs.map(f => ({ file: f, folder: '03_Complex_Words' })),
  ...stage04Gifs.map(f => ({ file: f, folder: '04_Advanced' }))
];

// Tạo Basic lessons - lọc GIF theo DANH SÁCH CHÍNH XÁC
console.log('\n📚 Tạo Basic lessons...');

const createdBasicLessons = [];
const usedGifs = new Set(); // Track GIFs đã được sử dụng

basicLessonsConfig.forEach((config) => {
  let matchedGifs = [];
  
  if (config.customId === 'b7') {
    // Bài 7: Lấy TỪ ĐƠN/ĐÔI còn lại (1-2 từ ghép, không phải câu)
    matchedGifs = allGifs.filter(item => {
      if (usedGifs.has(item.file)) return false;
      
      // Đếm số từ (tách bằng dấu _)
      const fileName = item.file.replace('.gif', '');
      const wordCount = fileName.split('_').length;
      
      // Chỉ lấy từ có 1-2 từ ghép (TỪ ĐƠN hoặc TỪ ĐÔI)
      return wordCount <= 2;
    });
    console.log(`   ${config.customId}: ${config.title} - Found ${matchedGifs.length} single/double words`);
  } else {
    // Các bài khác: Lọc theo DANH SÁCH TÊN FILE CHÍNH XÁC
    matchedGifs = allGifs.filter(item => {
      const fileName = item.file.replace('.gif', '').toLowerCase();
      return config.exactFiles.some(exactName => 
        fileName === exactName.toLowerCase()
      );
    });
    
    // Đánh dấu các GIF đã dùng
    matchedGifs.forEach(item => usedGifs.add(item.file));
    
    console.log(`   ${config.customId}: ${config.title} - Found ${matchedGifs.length} matching GIFs`);
  }
  
  // Tạo contents từ các GIF đã lọc - KHÔNG có "Ký hiệu cho"
  const contents = [];
  matchedGifs.forEach((item, index) => {
    const videoUrl = `${MEDIA_BASE_URL}/${item.folder}/gifs/${item.file}`;
    const label = item.file.replace('.gif', '').replace(/_/g, ' ');
    
    contents.push({
      label: label,
      description: label, // Chỉ hiển thị label, không có "Ký hiệu cho"
      videoUrl: videoUrl,
      order: index + 1
    });
  });
  
  const lesson = {
    customId: config.customId,
    title: config.title,
    description: config.description,
    difficulty: 'basic',
    type: 'lesson',
    folder: 'basic',
    questionCount: contents.length,
    contents: contents
  };
  
  createdBasicLessons.push(lesson);
  basicLessons.push(lesson);
});

// Tạo Practice lessons - lấy contents từ 2 lesson trước đó
console.log('\n🎮 Tạo Practice lessons...');

practiceLessonsConfig.forEach((config) => {
  // Lấy contents từ các lesson tương ứng
  const relatedLessons = createdBasicLessons.filter(l => config.lessonIds.includes(l.customId));
  const combinedContents = relatedLessons.flatMap(l => l.contents);
  
  console.log(`   ${config.customId}: ${config.title} - ${combinedContents.length} items from ${config.lessonIds.join(', ')}`);
  
  basicLessons.push({
    customId: config.customId,
    title: config.title,
    description: config.description,
    difficulty: 'basic',
    type: 'practice',
    folder: 'basic',
    questionCount: combinedContents.length,
    contents: combinedContents
  });
});

// Tạo Advanced lesson - Lấy TẤT CẢ CỤM TỪ/CÂU (≥3 từ ghép) còn lại
console.log('\n📚 Tạo Advanced lesson...');

// Lọc GIF là CỤM TỪ/CÂU (≥3 từ ghép) và chưa được dùng trong Basic
const advancedMatchedGifs = allGifs.filter(item => {
  // Bỏ qua nếu đã dùng trong Basic
  if (usedGifs.has(item.file)) return false;
  
  // Đếm số từ
  const fileName = item.file.replace('.gif', '');
  const wordCount = fileName.split('_').length;
  
  // Lấy các CỤM TỪ/CÂU có ít nhất 3 từ ghép
  return wordCount >= 3;
});

console.log(`   a1: Các câu nói cơ bản và nâng cao - Found ${advancedMatchedGifs.length} phrases/sentences`);

const advancedContents = [];
advancedMatchedGifs.forEach((item, index) => {
  const videoUrl = `${MEDIA_BASE_URL}/${item.folder}/gifs/${item.file}`;
  const label = item.file.replace('.gif', '').replace(/_/g, ' ');
  
  advancedContents.push({
    label: label,
    description: label, // Chỉ hiển thị label, không có "Ký hiệu cho"
    videoUrl: videoUrl,
    order: index + 1
  });
});

const advancedLesson = {
  customId: 'a1',
  title: 'Bài 1: Các câu nói cơ bản và nâng cao',
  description: 'Học các câu giao tiếp, cụm từ phức tạp trong cuộc sống hàng ngày',
  difficulty: 'advanced',
  type: 'lesson',
  folder: 'advanced',
  questionCount: advancedContents.length,
  contents: advancedContents
};

advancedLessons.push(advancedLesson);

// Practice cho Advanced - lấy contents từ lesson a1
console.log(`   p8: Luyện tập Giao tiếp nâng cao - ${advancedContents.length} items from a1`);

advancedLessons.push({
  customId: 'p8',
  title: 'Luyện tập: Giao tiếp nâng cao',
  description: 'Thực hành các câu giao tiếp và cụm từ phức tạp',
  difficulty: 'advanced',
  type: 'practice',
  folder: 'advanced',
  questionCount: advancedContents.length,
  contents: advancedContents // Dùng contents từ a1
});

const allNewLessons = [...basicLessons, ...advancedLessons];

async function seedLessons() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnbysign';
    
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa các lesson Basic và Advanced cũ
    await Lesson.deleteMany({ difficulty: { $in: ['basic', 'advanced'] } });
    console.log('🗑️  Cleared existing Basic and Advanced lessons');

    // Insert new lessons
    const result = await Lesson.insertMany(allNewLessons);
    console.log(`✅ Seeded ${result.length} new lessons (Basic + Advanced)`);

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 LESSON SUMMARY');
    console.log('='.repeat(70));
    result.forEach(lesson => {
      const contentsCount = lesson.contents?.length || 0;
      const sampleUrl = lesson.contents?.[0]?.videoUrl || 'N/A';
      console.log(`\n${lesson.customId} - ${lesson.title}`);
      console.log(`   Type: ${lesson.type} | Difficulty: ${lesson.difficulty}`);
      console.log(`   Contents: ${contentsCount} items`);
      if (contentsCount > 0) {
        console.log(`   Sample URL: ${sampleUrl}`);
      }
    });
    console.log('\n' + '='.repeat(70));

    mongoose.connection.close();
    console.log('\n✅ Done! Please run POST /lessons/sync-contents to finalize.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedLessons();
