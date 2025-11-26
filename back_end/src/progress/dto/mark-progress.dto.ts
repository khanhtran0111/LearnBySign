import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsEnum, IsString } from 'class-validator';

export class MarkProgressDto {
    @IsString()
    idUser: string;

    @IsString()
    idLesson: string;

    @IsEnum(['lesson', 'practice'])
    type: 'lesson' | 'practice';

    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsNumber()
    questionCount?: number;

    @IsOptional()
    @IsNumber()
    correctAnswers?: number;
}
