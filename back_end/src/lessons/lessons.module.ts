import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Progress, ProgressSchema } from '../progress/schemas/progress.schema';
import { MediaModule } from '../media/media.module';

@Module({
    imports: [
        MediaModule,
        MongooseModule.forFeature([
            { name: Lesson.name, schema: LessonSchema },
            { name: Progress.name, schema: ProgressSchema },
        ]),
    ],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService, MongooseModule],
})
export class LessonsModule { }
