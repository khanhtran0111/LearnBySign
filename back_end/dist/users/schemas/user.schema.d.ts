import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
export declare class User {
    email: string;
    phone?: string;
    passwordHash: string;
    fullName: string;
    birthDate?: Date;
    avatarUrl?: string;
    level: 'newbie' | 'basic' | 'advanced';
    progress: any;
    preferences: any;
    status: any;
    security: any;
    devices: Array<{
        deviceId: string;
        type: string;
        lastSeenAt: Date;
    }>;
    deletedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, import("mongoose").Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
