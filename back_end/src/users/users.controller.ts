import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.svc.findById(req.user.sub);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() body: UpdateUserDto) {
    return this.svc.update(req.user.sub, body);
  }

  @Patch('me/password')
  changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    return this.svc.changePassword(req.user.sub, body.currentPassword, body.newPassword);
  }
}
