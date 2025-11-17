import { IsEmail, IsString, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'kid@example.com' })
  @IsEmail() email: string;

  @ApiProperty({ minLength: 8, example: 'StrongPass123' })
  @IsString() @MinLength(8) password: string;

  @ApiProperty({ example: 'Tran Gia Khanh' })
  @IsString() fullName: string;

  @ApiProperty({ example: '0842349296' })
  @IsString() phone: string;

  @ApiProperty({ example: '2005-11-01' })
  @IsDateString() birthDate: string;
}
