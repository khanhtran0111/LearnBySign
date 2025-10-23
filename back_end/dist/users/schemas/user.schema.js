"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let User = class User {
    email;
    phone;
    passwordHash;
    fullName;
    birthDate;
    avatarUrl;
    level;
    progress;
    preferences;
    status;
    security;
    devices;
    deletedAt;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "birthDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['newbie', 'basic', 'advanced'], default: 'newbie' }),
    __metadata("design:type", String)
], User.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            lessonsCompleted: { type: Number, default: 0 },
            currentUnitId: { type: String, default: null },
            badges: { type: [String], default: [] }
        }, _id: false }),
    __metadata("design:type", Object)
], User.prototype, "progress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            language: { type: String, default: 'vi' },
            theme: { type: String, default: 'light' },
            subtitles: { type: Boolean, default: true },
            cameraFps: { type: Number, default: 30 }
        }, _id: false }),
    __metadata("design:type", Object)
], User.prototype, "preferences", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            emailVerified: { type: Boolean, default: false },
            phoneVerified: { type: Boolean, default: false },
            isActive: { type: Boolean, default: true },
            blockedAt: { type: Date, default: null }
        }, _id: false }),
    __metadata("design:type", Object)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            lastLoginAt: { type: Date, default: null },
            loginCount: { type: Number, default: 0 },
            mfaEnabled: { type: Boolean, default: false },
            provider: { type: String, default: 'local' },
            passwordUpdatedAt: { type: Date, default: null }
        }, _id: false }),
    __metadata("design:type", Object)
], User.prototype, "security", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ deviceId: String, type: String, lastSeenAt: Date }], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "devices", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ collection: 'user', timestamps: true, versionKey: false })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ email: 1 }, { unique: true, name: 'uniq_email' });
exports.UserSchema.index({ level: 1 }, { name: 'level_idx' });
exports.UserSchema.index({ 'status.isActive': 1 }, { name: 'active_idx' });
//# sourceMappingURL=user.schema.js.map