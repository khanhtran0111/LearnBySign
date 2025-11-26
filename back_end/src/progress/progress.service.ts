import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { MarkProgressDto } from './dto/mark-progress.dto';
import { Lesson, LessonDocument } from '../lessons/schemas/lesson.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProgressService {
    constructor(
        @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async markProgress(markProgressDto: MarkProgressDto): Promise<Progress> {
        const { idUser, idLesson, type, questionCount, correctAnswers, ...updateData } = markProgressDto;

        let calculatedScore = 0;
        if (type === 'lesson' && questionCount) {
            calculatedScore = questionCount * 10;
        } else if (type === 'practice' && correctAnswers) {
            calculatedScore = correctAnswers * 15;
        }

        // Kiểm tra xem idLesson có phải là ObjectId hợp lệ không
        let lessonId = idLesson;
        if (!mongoose.Types.ObjectId.isValid(idLesson)) {
            try {
                const lesson = await this.lessonModel.findOne({ customId: idLesson }).exec();
                if (lesson) {
                    lessonId = lesson._id.toString();
                } else {
                    const newLesson = await this.lessonModel.create({
                        title: `Lesson ${idLesson}`,
                        description: 'Auto-generated lesson',
                        difficulty: 'newbie',
                        type: type,
                        questionCount: questionCount || 1,
                        mediaUrl: `/videos/${idLesson}`,
                        folder: 'auto',
                        customId: idLesson,
                    });
                    lessonId = newLesson._id.toString();
                }
            } catch (err) {
                throw new Error('Invalid lesson ID');
            }
        }

        const progress = await this.progressModel.findOneAndUpdate(
            { idUser, idLesson: lessonId },
            {
                $set: {
                    type,
                    questionCount: questionCount || 0,
                    correctAnswers: correctAnswers || 0,
                    score: calculatedScore,
                    ...updateData,
                    lastViewedAt: new Date()
                }
            },
            { new: true, upsert: true }
        ).exec();

        if (updateData.completed) {
            await this.updateUserStats(idUser, type, calculatedScore);
        }

        return progress;
    }

    private async updateUserStats(userId: string, type: 'lesson' | 'practice', points: number): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) return;

        if (type === 'lesson') {
            user.lessonPoints = (user.lessonPoints || 0) + points;
        } else {
            user.practicePoints = (user.practicePoints || 0) + points;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastStudyDate) {
            const lastStudy = new Date(user.lastStudyDate);
            lastStudy.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
            } else if (diffDays === 1) {
                user.currentStreak = (user.currentStreak || 0) + 1;
                user.lastStudyDate = today;
            } else {
                user.currentStreak = 1;
                user.lastStudyDate = today;
            }
        } else {
            user.currentStreak = 1;
            user.lastStudyDate = today;
        }

        await user.save();
    }

    async findAll(): Promise<Progress[]> {
        return this.progressModel.find().populate('idLesson').exec();
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
