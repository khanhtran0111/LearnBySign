import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    private normalizeEmail;
    create(dto: CreateUserDto): Promise<{
        id: string;
    }>;
    findById(id: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null, import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "findOne", {}>;
    findByEmail(email: string): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null, import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "findOne", {}>;
    update(id: string, patch: UpdateUserDto): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    softDelete(id: string): Promise<{
        ok: boolean;
    }>;
    changePassword(id: string, currentPassword: string, newPassword: string): Promise<{
        ok: boolean;
    }>;
}
