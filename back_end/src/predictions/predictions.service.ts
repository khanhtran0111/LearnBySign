import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prediction, PredictionDocument } from './prediction.schema';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(@InjectModel(Prediction.name) private model: Model<PredictionDocument>) {}

  create(dto: CreatePredictionDto) { return this.model.create(dto); }

  top1CountsSince(date: Date) {
    return this.model.aggregate([
      { $match: { createdAt: { $gte: date } } },
      { $project: { top1: { $arrayElemAt: ['$topk', 0] } } },
      { $group: { _id: '$top1.label', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }
}
