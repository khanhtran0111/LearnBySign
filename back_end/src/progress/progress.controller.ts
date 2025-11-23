import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { MarkProgressDto } from './dto/mark-progress.dto';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @Post('mark')
    markProgress(@Body() markProgressDto: MarkProgressDto) {
        return this.progressService.markProgress(markProgressDto);
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
