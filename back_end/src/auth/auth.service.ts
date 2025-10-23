import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async register(dto: { email: string; password: string; fullName: string; phone?: string; birthDate?: string }) {
    const res = await this.users.create(dto as any);
    const user = await this.users.findById(res.id);
    return this.sign(user);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Sai thông tin đăng nhập');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Sai thông tin đăng nhập');
    return this.sign(user);
  }

  private sign(user: any) {
    const payload = { sub: String(user._id), email: user.email };
    const access_token = this.jwt.sign(payload);
    return {
      access_token,
      user: { id: String(user._id), email: user.email, fullName: user.fullName, level: user.level }
    };
  }
}
