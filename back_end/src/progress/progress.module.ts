import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

import { LessonsModule } from '../lessons/lessons.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Progress.name, schema: ProgressSchema },
            { name: User.name, schema: UserSchema }
        ]),
        LessonsModule,
    ],
    controllers: [ProgressController],
    providers: [ProgressService],
    exports: [ProgressService],
})
export class ProgressModule { }
