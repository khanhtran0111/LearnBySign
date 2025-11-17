import { Schema } from "mongoose";
declare const _default: import("mongoose").Model<{
    level: "newbie" | "basic" | "advance";
    title: string;
    createdAt: NativeDate;
    description?: string | null | undefined;
    category?: string | null | undefined;
    videoUrl?: string | null | undefined;
    gifUrl?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    level: "newbie" | "basic" | "advance";
    title: string;
    createdAt: NativeDate;
    description?: string | null | undefined;
    category?: string | null | undefined;
    videoUrl?: string | null | undefined;
    gifUrl?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}, {}, import("mongoose").DefaultSchemaOptions> & {
    level: "newbie" | "basic" | "advance";
    title: string;
    createdAt: NativeDate;
    description?: string | null | undefined;
    category?: string | null | undefined;
    videoUrl?: string | null | undefined;
    gifUrl?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    level: "newbie" | "basic" | "advance";
    title: string;
    createdAt: NativeDate;
    description?: string | null | undefined;
    category?: string | null | undefined;
    videoUrl?: string | null | undefined;
    gifUrl?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    level: "newbie" | "basic" | "advance";
    title: string;
    createdAt: NativeDate;
    description?: string | null | undefined;
    category?: string | null | undefined;
    videoUrl?: string | null | undefined;
    gifUrl?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
    level: "newbie" | "basic" | "advance";
    title: string;
    createdAt: NativeDate;
    description?: string | null | undefined;
    category?: string | null | undefined;
    videoUrl?: string | null | undefined;
    gifUrl?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
