import { HydratedDocument } from 'mongoose';
declare class TopKItem {
    label: string;
    p: number;
}
export declare class Prediction {
    _id?: string;
    sequenceId: string;
    modelId: string;
    topk: TopKItem[];
}
export type PredictionDocument = HydratedDocument<Prediction>;
export declare const PredictionSchema: import("mongoose").Schema<Prediction, import("mongoose").Model<Prediction, any, any, any, import("mongoose").Document<unknown, any, Prediction, any, {}> & Prediction & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Prediction, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Prediction>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Prediction> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
export {};
