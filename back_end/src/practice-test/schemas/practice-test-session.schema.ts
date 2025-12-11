import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PracticeTestSession extends Document {
  @Prop({ required: true })
  idUser: string;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  correctAnswers: number;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  duration: number; // seconds

  @Prop({ type: Array, default: [] })
  answers: Array<{
    questionId: string;
    questionLabel: string;
    userAnswer: string;
    isCorrect: boolean;
    modelType: string;
  }>;

  @Prop({ default: Date.now })
  completedAt: Date;
}

export const PracticeTestSessionSchema = SchemaFactory.createForClass(PracticeTestSession);
