import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: UsersService, jwt: JwtService);
    register(dto: {
        email: string;
        password: string;
        fullName: string;
        phone?: string;
        birthDate?: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: any;
            fullName: any;
            level: any;
        };
    }>;
    login(dto: {
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
    private sign;
}
