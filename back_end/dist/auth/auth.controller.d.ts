import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(body: CreateUserDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: any;
            fullName: any;
            level: any;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: any;
            fullName: any;
            level: any;
        };
    }>;
    me(req: any): any;
}
