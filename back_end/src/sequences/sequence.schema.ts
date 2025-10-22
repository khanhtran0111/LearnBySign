import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'sequences', timestamps: true })
export class Sequence {
  _id?: string;

  @Prop({ required: true }) sessionId: string;
  @Prop({ required: true, min: 0 }) tStartMs: number;
  @Prop({ required: true, min: 0 }) tEndMs: number;
  @Prop() label?: string;
  @Prop({ type: Object, required: true }) keypoints: any;
}
export type SequenceDocument = HydratedDocument<Sequence>;
export const SequenceSchema = SchemaFactory.createForClass(Sequence);
SequenceSchema.index({ sessionId: 1, tStartMs: 1 });
