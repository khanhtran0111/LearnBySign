import { IsBoolean, IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class MarkProgressDto {
    @IsMongoId()
    idUser: string;

    @IsMongoId()
    idLesson: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsNumber()
    score?: number;
}
