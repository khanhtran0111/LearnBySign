import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ collection: 'lessons', timestamps: true, versionKey: false })
export class Lesson {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ required: true, enum: ['newbie', 'basic', 'advanced'], default: 'newbie' })
    difficulty: 'newbie' | 'basic' | 'advanced';

    @Prop({ required: true, enum: ['lesson', 'practice'], default: 'lesson' })
    type: 'lesson' | 'practice';

    @Prop({ default: 1 })
    questionCount: number;

    @Prop({ required: true })
    mediaUrl: string;

    @Prop({ required: true })
    folder: string;

    @Prop({ unique: true, sparse: true })
    customId?: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Indexes
LessonSchema.index({ difficulty: 1 });
LessonSchema.index({ customId: 1 });
