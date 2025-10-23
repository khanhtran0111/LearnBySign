import { IsOptional, IsString, IsUrl, IsDateString, Matches, IsIn, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsUrl() avatarUrl?: string;

  @IsOptional() @IsIn(['newbie','basic','advanced']) level?: 'newbie'|'basic'|'advanced';

  @IsOptional() preferences?: {
    language?: 'vi'|'en';
    theme?: 'light'|'dark';
    subtitles?: boolean;
    cameraFps?: 15|30|60;
  };

  @IsOptional() status?: {
    isActive?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
}
