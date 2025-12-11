import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GameSession extends Document {
  @Prop({ required: true })
  idUser: string;

  @Prop({ required: true, enum: ['newbie', 'basic', 'advanced'] })
  level: string;

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
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;

  @Prop({ default: Date.now })
  completedAt: Date;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);
