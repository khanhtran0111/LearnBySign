import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(['newbie', 'basic', 'advanced'])
    difficulty: 'newbie' | 'basic' | 'advanced';

    @IsNotEmpty()
    @IsString()
    mediaUrl: string;

    @IsNotEmpty()
    @IsString()
    folder: string;
}

export class UpdateLessonDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(['newbie', 'basic', 'advanced'])
    difficulty?: 'newbie' | 'basic' | 'advanced';

    @IsOptional()
    @IsString()
    mediaUrl?: string;

    @IsOptional()
    @IsString()
    folder?: string;
}
