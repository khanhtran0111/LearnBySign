import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

class TopKItem {
  @Prop({ required: true }) label: string;
  @Prop({ required: true, min: 0, max: 1 }) p: number;
}

@Schema({ collection: 'predictions', timestamps: { createdAt: true, updatedAt: false } })
export class Prediction {
  _id?: string;

  @Prop({ required: true }) sequenceId: string; // lưu ObjectId dạng string
  @Prop({ required: true }) modelId: string;
  @Prop({ type: [TopKItem], required: true }) topk: TopKItem[];
}
export type PredictionDocument = HydratedDocument<Prediction>;
export const PredictionSchema = SchemaFactory.createForClass(Prediction);
PredictionSchema.index({ sequenceId: 1, createdAt: -1 });
