import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo bài học mới' })
    @ApiResponse({ status: 201, description: 'Bài học đã được tạo thành công' })
    create(@Body() createLessonDto: CreateLessonDto) {
        return this.lessonsService.create(createLessonDto);
    }

    // --- ĐÃ XÓA ENDPOINT sync-data CŨ VÌ KHÔNG DÙNG NỮA ---

    @Post('sync-contents')
    @ApiOperation({
        summary: 'Đồng bộ contents cho các bài học (Grid Layout)',
        description: 'Duyệt qua các bài học trong DB, lấy files từ Supabase và tạo mảng contents (Label, VideoUrl...) cho mỗi bài học',
    })
    @ApiResponse({
        status: 201,
        description: 'Đồng bộ contents thành công',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Sync Contents Completed' },
                totalLessons: { type: 'number', example: 10 },
                successCount: { type: 'number', example: 8 },
                details: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            lessonId: { type: 'string' },
                            customId: { type: 'string' },
                            title: { type: 'string' },
                            contentsCount: { type: 'number' },
                            status: { type: 'string', enum: ['success', 'failed'] },
                        },
                    },
                },
            },
        },
    })
    syncContents() {
        return this.lessonsService.syncLessonContents();
    }

    @Get('with-progress/:userId')
    @ApiOperation({ 
        summary: 'Lấy danh sách bài học kèm trạng thái locked dựa trên tiến độ user',
        description: 'Logic unlock: Newbie tuần tự, Basic cần hoàn thành Newbie, Advanced cần hoàn thành Basic'
    })
    @ApiParam({ name: 'userId', description: 'ID của user' })
    @ApiQuery({
        name: 'difficulty',
        required: false,
        enum: ['newbie', 'basic', 'advanced'],
        description: 'Lọc theo độ khó',
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Danh sách bài học với isLocked và isCompleted',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    customId: { type: 'string' },
                    difficulty: { type: 'string' },
                    isLocked: { type: 'boolean', description: 'True nếu chưa đủ điều kiện unlock' },
                    isCompleted: { type: 'boolean', description: 'True nếu đã hoàn thành' },
                }
            }
        }
    })
    getLessonsWithProgress(
        @Param('userId') userId: string,
        @Query('difficulty') difficulty?: string
    ) {
        return this.lessonsService.getLessonsWithProgress(userId, difficulty);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả bài học' })
    @ApiQuery({
        name: 'difficulty',
        required: false,
        enum: ['newbie', 'basic', 'advanced'],
        description: 'Lọc theo độ khó',
    })
    @ApiResponse({ status: 200, description: 'Danh sách bài học' })
    findAll(@Query('difficulty') difficulty?: string) {
        return this.lessonsService.findAll(difficulty);
    }

    @Get('by-custom-id/:customId')
    @ApiOperation({ summary: 'Lấy bài học theo Custom ID' })
    @ApiParam({ name: 'customId', description: 'Custom ID của bài học (VD: n1, n2)' })
    @ApiResponse({ status: 200, description: 'Chi tiết bài học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
    findByCustomId(@Param('customId') customId: string) {
        return this.lessonsService.findByCustomId(customId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết một bài học theo ID',
        description: 'API này trả về thông tin chi tiết của bài học bao gồm mảng contents để Frontend render Grid Cards',
    })
    @ApiParam({
        name: 'id',
        description: 'MongoDB ObjectId của bài học (24 ký tự hex)',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'Chi tiết bài học với contents array',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                title: { type: 'string', example: 'Bài 1: Chữ A-H' },
                description: { type: 'string', example: 'Chữ cái & Số' },
                difficulty: { type: 'string', enum: ['newbie', 'basic', 'advanced'], example: 'newbie' },
                type: { type: 'string', enum: ['lesson', 'practice'], example: 'lesson' },
                questionCount: { type: 'number', example: 8 },
                folder: { type: 'string', example: '01_Alphabet_Numbers/gifs' },
                contents: {
                    type: 'array',
                    description: 'Mảng các card content để render grid',
                    items: {
                        type: 'object',
                        properties: {
                            label: { type: 'string', example: 'A' },
                            description: { type: 'string', example: 'Nắm tay, ngón cái dựng thẳng' },
                            videoUrl: { type: 'string', example: 'https://xxx.supabase.co/.../a.gif' },
                            thumbnailUrl: { type: 'string', example: null },
                        },
                    },
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'ID không đúng định dạng MongoDB ObjectId',
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy bài học với ID này',
    })
    findOne(@Param('id') id: string) {
        return this.lessonsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật bài học' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId của bài học' })
    @ApiResponse({ status: 200, description: 'Bài học đã được cập nhật' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
    update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
        return this.lessonsService.update(id, updateLessonDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa bài học' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId của bài học' })
    @ApiResponse({ status: 200, description: 'Bài học đã được xóa' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }
}