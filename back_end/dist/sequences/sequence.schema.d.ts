import { HydratedDocument } from 'mongoose';
export declare class Sequence {
    _id?: string;
    sessionId: string;
    tStartMs: number;
    tEndMs: number;
    label?: string;
    keypoints: any;
}
export type SequenceDocument = HydratedDocument<Sequence>;
export declare const SequenceSchema: import("mongoose").Schema<Sequence, import("mongoose").Model<Sequence, any, any, any, import("mongoose").Document<unknown, any, Sequence, any, {}> & Sequence & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Sequence, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Sequence>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Sequence> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
