// progress.model.ts
import { Schema, model } from "mongoose";

const ProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  lastViewed: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },       // Nếu có bài kiểm tra/trắc nghiệm
});

export default model("Progress", ProgressSchema);
