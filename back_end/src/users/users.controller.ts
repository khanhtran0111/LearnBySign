import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.svc.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.svc.update(id, body);
  }
}
