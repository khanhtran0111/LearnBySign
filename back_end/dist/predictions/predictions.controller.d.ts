import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
export declare class PredictionsController {
    private readonly svc;
    constructor(svc: PredictionsService);
    create(dto: CreatePredictionDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./prediction.schema").Prediction, {}, {}> & import("./prediction.schema").Prediction & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./prediction.schema").Prediction, {}, {}> & import("./prediction.schema").Prediction & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    top1(days?: string): import("mongoose").Aggregate<any[]>;
}
