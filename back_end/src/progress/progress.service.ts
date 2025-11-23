import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { MarkProgressDto } from './dto/mark-progress.dto';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';

@Injectable()
export class ProgressService {
    constructor(
        @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    ) { }

    async markProgress(markProgressDto: MarkProgressDto): Promise<Progress> {
        const { idUser, idLesson, ...updateData } = markProgressDto;

        return this.progressModel.findOneAndUpdate(
            { idUser, idLesson },
            {
                $set: {
                    ...updateData,
                    lastViewedAt: new Date()
                }
            },
            { new: true, upsert: true }
        ).exec();
    }

    async findByUser(idUser: string): Promise<Progress[]> {
        return this.progressModel.find({ idUser }).populate('idLesson').exec();
    }

    async seedProgressForUser(idUser: string): Promise<any> {
        try {
            console.log(`Seeding progress for user: ${idUser}`);

            // 1. Get all lessons
            const allLessons = await this.lessonModel.find().exec();
            if (allLessons.length === 0) {
                return { message: 'No lessons found to seed.' };
            }

            // 2. Randomly select 50-70% of lessons
            const percentage = 0.5 + Math.random() * 0.2; // 0.5 to 0.7
            const numberOfLessonsToSeed = Math.floor(allLessons.length * percentage);

            // Shuffle and pick
            const shuffled = allLessons.sort(() => 0.5 - Math.random());
            const selectedLessons = shuffled.slice(0, numberOfLessonsToSeed);

            // 3. Delete old progress for this user
            await this.progressModel.deleteMany({ idUser }).exec();

            // 4. Create new progress data
            const progressData = selectedLessons.map(lesson => ({
                idUser,
                idLesson: lesson._id,
                completed: true,
                score: Math.floor(Math.random() * 6) + 5, // 5 to 10
                lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random within last 7 days
            }));

            await this.progressModel.insertMany(progressData);

            console.log(`Seeded ${progressData.length} progress records for user ${idUser}`);
            return {
                message: 'Success',
                seededCount: progressData.length,
                totalLessons: allLessons.length
            };

        } catch (error) {
            console.error('Seeding progress failed:', error);
            throw error;
        }
    }
}
