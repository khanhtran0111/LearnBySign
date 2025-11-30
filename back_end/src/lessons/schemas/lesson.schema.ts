import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LessonDocument = HydratedDocument<Lesson>;

/**
 * Schema cho từng item content trong bài học (mỗi card trong grid)
 */
export class LessonContent {
    @ApiProperty({ example: 'A', description: 'Label hiển thị trên card' })
    label: string;

    @ApiProperty({ example: 'Nắm tay, ngón cái dựng thẳng', description: 'Mô tả cách thực hiện' })
    description: string;

    @ApiProperty({ example: 'https://xxx.supabase.co/.../a.gif', description: 'URL video/gif' })
    videoUrl: string;

    @ApiProperty({ example: 'https://xxx.supabase.co/.../a_thumb.png', description: 'URL thumbnail (optional)' })
    thumbnailUrl?: string;
}

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

    @Prop()
    mediaUrl?: string;

    @Prop({ required: true })
    folder: string;

    @Prop({ unique: true, sparse: true })
    customId?: string;

    @Prop({ type: [Object], default: [] })
    contents: LessonContent[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Indexes
LessonSchema.index({ difficulty: 1 });
LessonSchema.index({ customId: 1 });
