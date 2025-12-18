const mongoose = require('mongoose');
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
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema, 'lessons');

const lessonsData = [
  { customId: 'n1', title: 'Bài 1: Chữ cái A-H', description: 'Học ký hiệu của 8 chữ cái đầu tiên', difficulty: 'newbie', type: 'lesson', questionCount: 8, mediaUrl: '/videos/n1.mp4', folder: 'newbie' },
  { customId: 'n2', title: 'Bài 2: Chữ cái I-P', description: 'Tiếp tục học ký hiệu cho chữ cái I đến P', difficulty: 'newbie', type: 'lesson', questionCount: 8, mediaUrl: '/videos/n2.mp4', folder: 'newbie' },
  { customId: 'n3', title: 'Bài 3: Chữ cái Q-Z', description: 'Hoàn thành bảng chữ cái', difficulty: 'newbie', type: 'lesson', questionCount: 10, mediaUrl: '/videos/n3.mp4', folder: 'newbie' },
  { customId: 'n4', title: 'Bài 4: Số 0-9', description: 'Học ký hiệu cho các số', difficulty: 'newbie', type: 'lesson', questionCount: 10, mediaUrl: '/videos/n4.mp4', folder: 'newbie' },
  
  { customId: 'p1', title: 'Luyện tập bảng chữ cái', description: 'Luyện tập các chữ cái A-H', difficulty: 'newbie', type: 'practice', questionCount: 8, mediaUrl: '/practice/p1', folder: 'newbie' },
  { customId: 'p2', title: 'Luyện tập bảng chữ cái', description: 'Luyện tập các chữ cái I-P', difficulty: 'newbie', type: 'practice', questionCount: 8, mediaUrl: '/practice/p2', folder: 'newbie' },
  { customId: 'p3', title: 'Luyện tập bảng chữ cái', description: 'Luyện tập các chữ cái Q-Z', difficulty: 'newbie', type: 'practice', questionCount: 10, mediaUrl: '/practice/p3', folder: 'newbie' },
  { customId: 'p4', title: 'Luyện tập số 0-9', description: 'Thực hành ký hiệu các con số', difficulty: 'newbie', type: 'practice', questionCount: 10, mediaUrl: '/practice/p4', folder: 'newbie' },
  
  { customId: 'b1', title: 'Bài 1: Động vật - Animals', description: 'Học từ vựng về các loài động vật', difficulty: 'basic', type: 'lesson', questionCount: 10, mediaUrl: '/videos/b1.mp4', folder: 'basic' },
  { customId: 'b2', title: 'Bài 2: Màu sắc - Colors', description: 'Ký hiệu cho các màu sắc cơ bản', difficulty: 'basic', type: 'lesson', questionCount: 8, mediaUrl: '/videos/b2.mp4', folder: 'basic' },
  { customId: 'b3', title: 'Bài 3: Gia đình - Family', description: 'Từ vựng về các thành viên trong gia đình', difficulty: 'basic', type: 'lesson', questionCount: 12, mediaUrl: '/videos/b3.mp4', folder: 'basic' },
  { customId: 'b4', title: 'Bài 4: Thức ăn - Food', description: 'Học từ vựng về đồ ăn và thức uống', difficulty: 'basic', type: 'lesson', questionCount: 15, mediaUrl: '/videos/b4.mp4', folder: 'basic' },
  
  { customId: 'a1', title: 'Bài 1: Chào hỏi cơ bản', description: 'Các câu chào hỏi và giới thiệu bản thân', difficulty: 'advanced', type: 'lesson', questionCount: 5, mediaUrl: '/videos/a1.mp4', folder: 'advanced' },
  { customId: 'a2', title: 'Bài 2: Hỏi đáp thông tin', description: 'Cách hỏi và trả lời các câu hỏi', difficulty: 'advanced', type: 'lesson', questionCount: 8, mediaUrl: '/videos/a2.mp4', folder: 'advanced' },
  { customId: 'a3', title: 'Bài 3: Giao tiếp hàng ngày', description: 'Các câu giao tiếp trong sinh hoạt hàng ngày', difficulty: 'advanced', type: 'lesson', questionCount: 10, mediaUrl: '/videos/a3.mp4', folder: 'advanced' },
];

async function seedLessons() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnbysign';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Lesson.deleteMany({});
    console.log('🗑️  Cleared existing lessons');

    const result = await Lesson.insertMany(lessonsData);
    console.log(`✅ Seeded ${result.length} lessons`);

    console.log('\n📋 Lesson ID Mapping:');
    const lessons = await Lesson.find({});
    lessons.forEach(lesson => {
      console.log(`  ${lesson.customId} -> ${lesson._id}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedLessons();
