import { IsEmail, IsString, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;      // plain ở DTO
  @IsString() fullName: string;
  @IsString() phone: string;                        // chỉ string thường
  @IsDateString() birthDate: string;                // ISO: YYYY-MM-DD hoặc full ISO
}
