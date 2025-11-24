"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProgressSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Lesson", required: true },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started',
    },
    lastViewed: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
});
exports.default = (0, mongoose_1.model)("Progress", ProgressSchema);
//# sourceMappingURL=progress.schema.js.map