// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'user', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ trim: true }) phone?: string;                 // chỉ string thường
  @Prop({ required: true }) passwordHash: string;
  @Prop({ required: true, trim: true }) fullName: string;
  @Prop() birthDate?: Date;
  @Prop() avatarUrl?: string;

  @Prop({ enum: ['newbie', 'basic', 'advanced'], default: 'newbie' })
  level: 'newbie'|'basic'|'advanced';

  @Prop({ type: {
    lessonsCompleted: { type: Number, default: 0 },
    currentUnitId: { type: String, default: null },
    badges: { type: [String], default: [] }
  }, _id: false })
  progress: any;

  @Prop({ type: {
    language: { type: String, default: 'vi' },
    theme: { type: String, default: 'light' },
    subtitles: { type: Boolean, default: true },
    cameraFps: { type: Number, default: 30 }
  }, _id: false })
  preferences: any;

  @Prop({ type: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    blockedAt: { type: Date, default: null }
  }, _id: false })
  status: any;

  @Prop({ type: {
    lastLoginAt: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
    mfaEnabled: { type: Boolean, default: false },
    provider: { type: String, default: 'local' },
    passwordUpdatedAt: { type: Date, default: null }
  }, _id: false })
  security: any;

  @Prop({ type: [{ deviceId: String, type: String, lastSeenAt: Date }], default: [] })
  devices: Array<{ deviceId: string; type: string; lastSeenAt: Date }>;

  @Prop({ default: null }) deletedAt?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);

// indexes
UserSchema.index({ email: 1 }, { unique: true, name: 'uniq_email' });
UserSchema.index({ level: 1 }, { name: 'level_idx' });
UserSchema.index({ 'status.isActive': 1 }, { name: 'active_idx' });
// không tạo index phone
