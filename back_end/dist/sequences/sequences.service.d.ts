import { Model } from 'mongoose';
import { Sequence, SequenceDocument } from './sequence.schema';
import { CreateSequenceDto } from './dto/create-sequence.dto';
export declare class SequencesService {
    private model;
    constructor(model: Model<SequenceDocument>);
    create(dto: CreateSequenceDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Sequence, {}, {}> & Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Sequence, {}, {}> & Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Sequence, {}, {}> & Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }> & Required<{
        _id: string;
    }>) | null, import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Sequence, {}, {}> & Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Sequence, {}, {}> & Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, import("mongoose").Document<unknown, {}, Sequence, {}, {}> & Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "findOne", {}>;
}
