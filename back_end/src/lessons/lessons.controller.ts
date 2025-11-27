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

    @Post('sync-data')
    @ApiOperation({ summary: 'Đồng bộ dữ liệu bài học từ Supabase Storage' })
    @ApiResponse({ status: 201, description: 'Đồng bộ thành công' })
    syncData() {
        return this.lessonsService.syncLessonsFromSupabase();
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
    @ApiParam({ name: 'customId', description: 'Custom ID của bài học' })
    @ApiResponse({ status: 200, description: 'Chi tiết bài học' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
    findByCustomId(@Param('customId') customId: string) {
        return this.lessonsService.findByCustomId(customId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết một bài học theo ID',
        description: 'API này trả về thông tin chi tiết của bài học bao gồm mediaUrl để Frontend render video (hỗ trợ tua nhanh/chậm)',
    })
    @ApiParam({
        name: 'id',
        description: 'MongoDB ObjectId của bài học (24 ký tự hex)',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: 200,
        description: 'Chi tiết bài học với mediaUrl để render video',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                title: { type: 'string', example: 'Chữ A' },
                description: { type: 'string', example: 'Chữ cái & Số' },
                difficulty: { type: 'string', enum: ['newbie', 'basic', 'advanced'], example: 'newbie' },
                type: { type: 'string', enum: ['lesson', 'practice'], example: 'lesson' },
                questionCount: { type: 'number', example: 1 },
                mediaUrl: { type: 'string', example: 'https://xxx.supabase.co/storage/v1/object/public/vsl-media/01_Alphabet_Numbers/gifs/A.gif' },
                folder: { type: 'string', example: '01_Alphabet_Numbers/gifs' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'ID không đúng định dạng MongoDB ObjectId',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'ID "abc123" không đúng định dạng MongoDB ObjectId' },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy bài học với ID này',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Không tìm thấy bài học với ID: 507f1f77bcf86cd799439011' },
                error: { type: 'string', example: 'Not Found' },
            },
        },
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
