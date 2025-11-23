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
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Post()
    create(@Body() createLessonDto: CreateLessonDto) {
        return this.lessonsService.create(createLessonDto);
    }

    @Post('sync-data')
    syncData() {
        return this.lessonsService.syncLessonsFromSupabase();
    }

    @Get()
    findAll(@Query('difficulty') difficulty?: string) {
        return this.lessonsService.findAll(difficulty);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.lessonsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
        return this.lessonsService.update(id, updateLessonDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }
}
