import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Query,
    Get,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import type { Express } from 'express';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('folder') folder: string,
    ) {
        if (!file) {
            throw new BadRequestException('File is not provided');
        }
        const url = await this.mediaService.uploadFile(file, folder);
        return { url };
    }

    @Get('list')
    async listFiles(@Query('folder') folder: string) {
        return this.mediaService.listFiles(folder);
    }
}
