// lesson.model.ts
import { Schema, model } from "mongoose";

const LessonSchema = new Schema({
  title: { type: String, required: true },             // Tên bài học, VD: “Xin chào”
  description: { type: String },                      // Mô tả ngắn
  level: { type: String, enum: ['newbie', 'basic', 'advance'], required: true },
  category: { type: String },                         // Chủ đề: “Chào hỏi”, “Gia đình”, v.v.
  videoUrl: { type: String },                         // Link video từ Cloud Storage
  gifUrl: { type: String },                           // Link gif mô tả ký hiệu
  thumbnailUrl: { type: String },                     // Ảnh preview
  createdAt: { type: Date, default: Date.now },
});

export default model("Lesson", LessonSchema);
