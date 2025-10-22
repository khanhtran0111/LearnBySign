import { SequencesService } from './sequences.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
export declare class SequencesController {
    private readonly svc;
    constructor(svc: SequencesService);
    create(dto: CreateSequenceDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./sequence.schema").Sequence, {}, {}> & import("./sequence.schema").Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./sequence.schema").Sequence, {}, {}> & import("./sequence.schema").Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    get(id: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./sequence.schema").Sequence, {}, {}> & import("./sequence.schema").Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }> & Required<{
        _id: string;
    }>) | null, import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./sequence.schema").Sequence, {}, {}> & import("./sequence.schema").Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./sequence.schema").Sequence, {}, {}> & import("./sequence.schema").Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, {}, import("mongoose").Document<unknown, {}, import("./sequence.schema").Sequence, {}, {}> & import("./sequence.schema").Sequence & Required<{
        _id: string;
    }> & {
        __v: number;
    }, "findOne", {}>;
}
