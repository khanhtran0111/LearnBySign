import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { MarkProgressDto } from './dto/mark-progress.dto';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @Post('mark')
    markProgress(@Body() markProgressDto: MarkProgressDto) {
        return this.progressService.markProgress(markProgressDto);
    }

    @Get()
    async getAllProgress(@Query('userId') userId?: string) {
        if (userId) {
            return this.progressService.findByUser(userId);
        }
        return this.progressService.findAll();
    }

    @Get(':idUser')
    findByUser(@Param('idUser') idUser: string) {
        return this.progressService.findByUser(idUser);
    }

    @Post('seed')
    seed(@Body('userId') userId: string) {
        return this.progressService.seedProgressForUser(userId);
    }
}
