import { Schema } from "mongoose";
declare const _default: import("mongoose").Model<{
    status: "not_started" | "in_progress" | "completed";
    userId: import("mongoose").Types.ObjectId;
    lessonId: import("mongoose").Types.ObjectId;
    lastViewed: NativeDate;
    score: number;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    status: "not_started" | "in_progress" | "completed";
    userId: import("mongoose").Types.ObjectId;
    lessonId: import("mongoose").Types.ObjectId;
    lastViewed: NativeDate;
    score: number;
}, {}, import("mongoose").DefaultSchemaOptions> & {
    status: "not_started" | "in_progress" | "completed";
    userId: import("mongoose").Types.ObjectId;
    lessonId: import("mongoose").Types.ObjectId;
    lastViewed: NativeDate;
    score: number;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    status: "not_started" | "in_progress" | "completed";
    userId: import("mongoose").Types.ObjectId;
    lessonId: import("mongoose").Types.ObjectId;
    lastViewed: NativeDate;
    score: number;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "not_started" | "in_progress" | "completed";
    userId: import("mongoose").Types.ObjectId;
    lessonId: import("mongoose").Types.ObjectId;
    lastViewed: NativeDate;
    score: number;
}>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
    status: "not_started" | "in_progress" | "completed";
    userId: import("mongoose").Types.ObjectId;
    lessonId: import("mongoose").Types.ObjectId;
    lastViewed: NativeDate;
    score: number;
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
