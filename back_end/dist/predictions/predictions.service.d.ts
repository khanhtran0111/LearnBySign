import { Model } from 'mongoose';
import { Prediction, PredictionDocument } from './prediction.schema';
import { CreatePredictionDto } from './dto/create-prediction.dto';
export declare class PredictionsService {
    private model;
    constructor(model: Model<PredictionDocument>);
    create(dto: CreatePredictionDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Prediction, {}, {}> & Prediction & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Prediction, {}, {}> & Prediction & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    top1CountsSince(date: Date): import("mongoose").Aggregate<any[]>;
}
