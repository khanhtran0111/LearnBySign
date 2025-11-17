"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LessonSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    level: { type: String, enum: ['newbie', 'basic', 'advance'], required: true },
    category: { type: String },
    videoUrl: { type: String },
    gifUrl: { type: String },
    thumbnailUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)("Lesson", LessonSchema);
//# sourceMappingURL=lesson.schema.js.map