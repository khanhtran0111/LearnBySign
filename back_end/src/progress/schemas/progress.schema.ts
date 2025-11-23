import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Lesson } from '../../lessons/schemas/lesson.schema';

export type ProgressDocument = HydratedDocument<Progress>;

@Schema({ collection: 'progress', timestamps: true, versionKey: false })
export class Progress {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    idUser: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    idLesson: Types.ObjectId;

    @Prop({ default: false })
    completed: boolean;

    @Prop({ default: 0 })
    score: number;

    @Prop({ default: Date.now })
    lastViewedAt: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Indexes
ProgressSchema.index({ idUser: 1, idLesson: 1 }, { unique: true });
