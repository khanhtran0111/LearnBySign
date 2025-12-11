import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkProgressDto {
    @ApiProperty({
        description: 'MongoDB ObjectId của user',
        example: '507f1f77bcf86cd799439012',
    })
    @IsString()
    idUser: string;

    @ApiProperty({
        description: 'MongoDB ObjectId hoặc customId của bài học',
        example: '507f1f77bcf86cd799439013',
    })
    @IsString()
    idLesson: string;

    @ApiPropertyOptional({
        description: 'Đánh dấu đã hoàn thành (mặc định true khi gọi API này)',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @ApiPropertyOptional({
        description: 'Điểm số (bắt buộc nếu type=lesson, hoặc tự tính từ correctAnswers nếu type=practice)',
        example: 80,
    })
    @IsOptional()
    @IsNumber()
    score?: number;

    @ApiPropertyOptional({
        description: 'Số câu trả lời đúng (dùng để tính điểm cho type=practice: correctAnswers * 15)',
        example: 6,
    })
    @IsOptional()
    @IsNumber()
    correctAnswers?: number;
}

export class MarkContentLearnedDto {
    @ApiProperty({
        description: 'MongoDB ObjectId của user',
        example: '507f1f77bcf86cd799439012',
    })
    @IsString()
    idUser: string;

    @ApiProperty({
        description: 'MongoDB ObjectId hoặc customId của bài học',
        example: 'n1',
    })
    @IsString()
    idLesson: string;

    @ApiProperty({
        description: 'Label của content đã học (VD: "A", "B", "Xin chào")',
        example: 'A',
    })
    @IsString()
    contentLabel: string;
}
