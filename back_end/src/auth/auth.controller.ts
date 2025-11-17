import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  register(@Body() body: CreateUserDto) {
    return this.auth.register(body as any);
  }

  @Post('login')
  @ApiBody({ schema: {
    properties: {
      email: { type: 'string', example: 'kid@example.com' },
      password: { type: 'string', example: 'StrongPass123' }
    },
    required: ['email','password'],
    type: 'object'
  }})
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  @ApiResponse({ status: 200, description: 'Thông tin người dùng từ JWT' })
  me(@Req() req: any) {
    return req.user;
  }
}
