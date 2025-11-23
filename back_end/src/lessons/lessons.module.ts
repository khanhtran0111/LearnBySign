import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { MediaModule } from '../media/media.module';

@Module({
    imports: [
        MediaModule,
        MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    ],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService, MongooseModule],
})
export class LessonsModule { }
