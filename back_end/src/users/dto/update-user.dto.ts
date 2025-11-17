import { IsOptional, IsString, IsUrl, IsDateString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Tran Gia Khanh' })
  @IsOptional() @IsString() fullName?: string;

  @ApiPropertyOptional({ example: '0842349296' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ example: '2005-09-30' })
  @IsOptional() @IsDateString() birthDate?: string;

  @ApiPropertyOptional({ example: 'https://.../avatar.png' })
  @IsOptional() @IsUrl() avatarUrl?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'OldPass123' })
  @IsString() @MinLength(8) currentPassword: string;

  @ApiPropertyOptional({ example: 'NewPass123' })
  @IsString() @MinLength(8) newPassword: string;
}
