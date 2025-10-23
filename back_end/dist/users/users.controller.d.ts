import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    me(req: any): import("mongoose").Query<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, {}> & import("./schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null, import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, {}> & import("./schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, {}> & import("./schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, {}> & import("./schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "findOne", {}>;
    updateMe(req: any, body: UpdateUserDto): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").User, {}, {}> & import("./schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    changePassword(req: any, body: ChangePasswordDto): Promise<{
        ok: boolean;
    }>;
}
