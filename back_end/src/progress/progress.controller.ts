import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { MarkProgressDto } from './dto/mark-progress.dto';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

    @Post('mark')
    @ApiOperation({
        summary: 'Lưu kết quả học tập',
        description: `Lưu/Cập nhật tiến độ khi user hoàn thành bài học hoặc bài tập.
        - Nếu chưa có record: Tạo mới với completed=true
        - Nếu đã có: Cập nhật lastViewedAt, giữ lại score cao nhất (kỷ lục)`,
    })
    @ApiBody({ type: MarkProgressDto })
    @ApiResponse({
        status: 201,
        description: 'Lưu tiến độ thành công',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                idUser: { type: 'string', example: '507f1f77bcf86cd799439012' },
                idLesson: { type: 'string', example: '507f1f77bcf86cd799439013' },
                type: { type: 'string', enum: ['lesson', 'practice'], example: 'lesson' },
                completed: { type: 'boolean', example: true },
                score: { type: 'number', example: 80, description: 'Điểm cao nhất (kỷ lục)' },
                questionCount: { type: 'number', example: 8 },
                correctAnswers: { type: 'number', example: 6 },
                lastViewedAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'userId hoặc lessonId không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
    markProgress(@Body() markProgressDto: MarkProgressDto) {
        return this.progressService.markProgress(markProgressDto);
    }

    @Get(':idUser')
    @ApiOperation({ summary: 'Lấy tiến độ của một user' })
    @ApiParam({ name: 'idUser', description: 'MongoDB ObjectId của user' })
    @ApiResponse({ status: 200, description: 'Danh sách tiến độ của user' })
    findByUser(@Param('idUser') idUser: string) {
        return this.progressService.findByUser(idUser);
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed dữ liệu tiến độ mẫu cho user (Dev only)' })
    @ApiBody({ 
    schema: {
        type: 'object',
        properties: {
            userId: { type: 'string', example: '68f9d805ea322ee5e359c752' }
                    }
            }
            })
    seedProgress(@Body('userId') userId: string) {
        return this.progressService.seedProgressForUser(userId);
    }
}
