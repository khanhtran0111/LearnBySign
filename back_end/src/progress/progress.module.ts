import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress, ProgressSchema } from './schemas/progress.schema';

import { LessonsModule } from '../lessons/lessons.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Progress.name, schema: ProgressSchema }]),
        LessonsModule,
    ],
    controllers: [ProgressController],
    providers: [ProgressService],
    exports: [ProgressService],
})
export class ProgressModule { }
