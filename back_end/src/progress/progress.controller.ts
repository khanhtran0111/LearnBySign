import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { MarkProgressDto, MarkContentLearnedDto } from './dto/mark-progress.dto';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy tiến độ của user hiện tại' })
    @ApiResponse({ status: 200, description: 'Danh sách tiến độ của user' })
    @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
    getMyProgress(@Req() req: any) {
        return this.progressService.findByUser(req.user.sub);
    }

    @Get('dashboard-stats')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Lấy thống kê Dashboard',
        description: 'Trả về các số liệu thống kê học tập của user: streak, điểm, tiến độ theo level',
    })
    @ApiResponse({
        status: 200,
        description: 'Thống kê Dashboard',
        schema: {
            type: 'object',
            properties: {
                streak: { type: 'number', example: 2, description: 'Số ngày học liên tiếp' },
                totalScore: { type: 'number', example: 150, description: 'Tổng điểm tích lũy' },
                totalCompleted: { type: 'number', example: 10, description: 'Tổng số bài đã hoàn thành' },
                overallProgress: { type: 'number', example: 35, description: '% hoàn thành toàn bộ khóa học' },
                levels: {
                    type: 'object',
                    properties: {
                        newbie: {
                            type: 'object',
                            properties: {
                                completed: { type: 'number', example: 5 },
                                total: { type: 'number', example: 15 },
                                percent: { type: 'number', example: 33 },
                            },
                        },
                        basic: {
                            type: 'object',
                            properties: {
                                completed: { type: 'number', example: 3 },
                                total: { type: 'number', example: 20 },
                                percent: { type: 'number', example: 15 },
                            },
                        },
                        advanced: {
                            type: 'object',
                            properties: {
                                completed: { type: 'number', example: 2 },
                                total: { type: 'number', example: 25 },
                                percent: { type: 'number', example: 8 },
                            },
                        },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
    getDashboardStats(@Req() req: any) {
        return this.progressService.getDashboardStats(req.user.sub);
    }

    @Post('mark')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
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

    @Post('mark-content')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Đánh dấu một content đã học trong lesson',
        description: 'API này được gọi khi user click "Đã hiểu" trên một card content (VD: chữ A, chữ B...). Lưu vào mảng learnedContents.',
    })
    @ApiBody({ type: MarkContentLearnedDto })
    @ApiResponse({ status: 201, description: 'Content đã được đánh dấu' })
    markContentLearned(@Body() dto: MarkContentLearnedDto) {
        return this.progressService.markContentLearned(dto.idUser, dto.idLesson, dto.contentLabel);
    }

    @Get('learned-contents/:lessonId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Lấy danh sách content đã học của một lesson',
        description: 'Trả về mảng các label (VD: ["A", "B", "C"]) đã được đánh dấu "Đã hiểu"',
    })
    @ApiParam({ name: 'lessonId', description: 'MongoDB ObjectId hoặc customId của lesson' })
    @ApiResponse({ status: 200, description: 'Danh sách label đã học', schema: { type: 'array', items: { type: 'string' } } })
    getLearnedContents(@Req() req: any, @Param('lessonId') lessonId: string) {
        return this.progressService.getLearnedContents(req.user.sub, lessonId);
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