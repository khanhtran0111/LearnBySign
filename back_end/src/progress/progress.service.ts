import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
    ) {}

    async markProgress(markProgressDto: MarkProgressDto): Promise<Progress> {
        const { idUser, idLesson, correctAnswers, score } = markProgressDto;

        if (!mongoose.Types.ObjectId.isValid(idUser)) {
            throw new BadRequestException(`userId "${idUser}" không đúng định dạng ObjectId`);
        }

        let resolvedLessonId: string;
        let lessonType: 'lesson' | 'practice';

        if (!mongoose.Types.ObjectId.isValid(idLesson)) {
            const lesson = await this.lessonModel.findOne({ customId: idLesson }).exec();
            if (!lesson) {
                throw new NotFoundException(`Không tìm thấy bài học với customId: ${idLesson}`);
            }
            resolvedLessonId = lesson._id.toString();
            lessonType = lesson.type;
        } else {
            const lesson = await this.lessonModel.findById(idLesson).exec();
            if (!lesson) {
                throw new NotFoundException(`Không tìm thấy bài học với ID: ${idLesson}`);
            }
            resolvedLessonId = lesson._id.toString();
            lessonType = lesson.type;
        }

        let calculatedScore = score ?? 0;
        if (score === undefined || score === null) {
            if (lessonType === 'practice' && correctAnswers) {
                calculatedScore = correctAnswers * 15;
            }
        }

        const existingProgress = await this.progressModel
            .findOne({ idUser, idLesson: resolvedLessonId })
            .exec();

        const finalScore = existingProgress
            ? Math.max(existingProgress.score || 0, calculatedScore)
            : calculatedScore;

        const progress = await this.progressModel
            .findOneAndUpdate(
                { idUser, idLesson: resolvedLessonId },
                {
                    $set: {
                        type: lessonType,
                        correctAnswers: correctAnswers || 0,
                        score: finalScore,
                        completed: true,
                        lastViewedAt: new Date(),
                    },
                },
                { new: true, upsert: true },
            )
            .exec();

        const pointsToAdd = existingProgress
            ? Math.max(0, calculatedScore - (existingProgress.score || 0))
            : calculatedScore;

        if (pointsToAdd > 0) {
            await this.updateUserStats(idUser, lessonType, pointsToAdd);
        } else if (!existingProgress) {
            await this.updateUserStats(idUser, lessonType, calculatedScore);
        }

        return progress;
    }

    private async updateUserStats(
        userId: string,
        type: 'lesson' | 'practice',
        points: number,
    ): Promise<void> {
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

            const diffDays = Math.floor(
                (today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (diffDays === 1) {
                user.currentStreak = (user.currentStreak || 0) + 1;
                user.lastStudyDate = today;
            } else if (diffDays > 1) {
                user.currentStreak = 1;
                user.lastStudyDate = today;
            }
        } else {
            user.currentStreak = 1;
            user.lastStudyDate = today;
        }

        await user.save();
    }

    async markContentLearned(
        idUser: string,
        idLesson: string,
        contentLabel: string,
    ): Promise<Progress> {
        if (!mongoose.Types.ObjectId.isValid(idUser)) {
            throw new BadRequestException(`userId "${idUser}" không đúng định dạng ObjectId`);
        }

        let resolvedLessonId: string;
        let lessonType: 'lesson' | 'practice';

        if (!mongoose.Types.ObjectId.isValid(idLesson)) {
            const lesson = await this.lessonModel.findOne({ customId: idLesson }).exec();
            if (!lesson) {
                throw new NotFoundException(`Không tìm thấy bài học với customId: ${idLesson}`);
            }
            resolvedLessonId = lesson._id.toString();
            lessonType = lesson.type;
        } else {
            const lesson = await this.lessonModel.findById(idLesson).exec();
            if (!lesson) {
                throw new NotFoundException(`Không tìm thấy bài học với ID: ${idLesson}`);
            }
            resolvedLessonId = lesson._id.toString();
            lessonType = lesson.type;
        }

        let progress = await this.progressModel
            .findOne({ idUser, idLesson: resolvedLessonId })
            .exec();

        if (!progress) {
            progress = new this.progressModel({
                idUser,
                idLesson: resolvedLessonId,
                type: lessonType,
                completed: false,
                learnedContents: [contentLabel],
                lastViewedAt: new Date(),
            });
        } else {
            // Thêm contentLabel vào learnedContents nếu chưa có
            if (!progress.learnedContents.includes(contentLabel)) {
                progress.learnedContents.push(contentLabel);
            }
            progress.lastViewedAt = new Date();
        }

        await progress.save();
        return progress;
    }

    async getLearnedContents(idUser: string, idLesson: string): Promise<string[]> {
        let resolvedLessonId: string;

        if (!mongoose.Types.ObjectId.isValid(idLesson)) {
            const lesson = await this.lessonModel.findOne({ customId: idLesson }).exec();
            if (!lesson) {
                return [];
            }
            resolvedLessonId = lesson._id.toString();
        } else {
            resolvedLessonId = idLesson;
        }

        const progress = await this.progressModel
            .findOne({ idUser, idLesson: resolvedLessonId })
            .exec();

        return progress?.learnedContents || [];
    }

    async findByUser(idUser: string): Promise<Progress[]> {
        return this.progressModel
            .find({ idUser })
            .populate('idLesson', 'title description difficulty customId type')
            .exec();
    }

    async seedProgressForUser(idUser: string): Promise<any> {
        try {
            console.log(`Seeding progress for user: ${idUser}`);

            const allLessons = await this.lessonModel.find().exec();
            if (allLessons.length === 0) {
                return { message: 'No lessons found to seed.' };
            }

            const percentage = 0.5 + Math.random() * 0.2;
            const numberOfLessonsToSeed = Math.floor(allLessons.length * percentage);

            const shuffled = allLessons.sort(() => 0.5 - Math.random());
            const selectedLessons = shuffled.slice(0, numberOfLessonsToSeed);

            await this.progressModel.deleteMany({ idUser }).exec();

            const progressData = selectedLessons.map((lesson) => ({
                idUser,
                idLesson: lesson._id,
                type: lesson.type,
                completed: true,
                score: Math.floor(Math.random() * 6) + 5,
                correctAnswers: lesson.type === 'practice' ? Math.floor(Math.random() * 5) + 1 : 0,
                lastViewedAt: new Date(
                    Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
                ),
            }));

            await this.progressModel.insertMany(progressData);

            console.log(`Seeded ${progressData.length} progress records for user ${idUser}`);
            return {
                message: 'Success',
                seededCount: progressData.length,
                totalLessons: allLessons.length,
            };
        } catch (error) {
            console.error('Seeding progress failed:', error);
            throw error;
        }
    }

    async getDashboardStats(userId: string): Promise<{
        streak: number;
        totalScore: number;
        totalCompleted: number;
        overallProgress: number;
        levels: {
            newbie: { completed: number; total: number; percent: number };
            basic: { completed: number; total: number; percent: number };
            advanced: { completed: number; total: number; percent: number };
        };
    }> {
        const user = await this.userModel.findById(userId).exec();
        const streak = user?.currentStreak || 0;

        const userProgress = await this.progressModel
            .find({ idUser: userId, completed: true })
            .exec();

        const totalScore = userProgress.reduce((sum, p) => sum + (p.score || 0), 0);
        const totalCompleted = userProgress.length;

        const completedLessonIds = userProgress.map((p) => p.idLesson.toString());

        const lessonCounts = await this.lessonModel.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    total: { $sum: 1 },
                    lessonIds: { $push: { $toString: '$_id' } },
                },
            },
        ]);

        const levels = {
            newbie: { completed: 0, total: 0, percent: 0 },
            basic: { completed: 0, total: 0, percent: 0 },
            advanced: { completed: 0, total: 0, percent: 0 },
        };

        let totalLessons = 0;

        for (const item of lessonCounts) {
            const difficulty = item._id as 'newbie' | 'basic' | 'advanced';
            if (levels[difficulty]) {
                levels[difficulty].total = item.total;
                totalLessons += item.total;

                const completedInLevel = item.lessonIds.filter((id: string) =>
                    completedLessonIds.includes(id),
                ).length;

                levels[difficulty].completed = completedInLevel;
                levels[difficulty].percent =
                    item.total > 0 ? Math.round((completedInLevel / item.total) * 100) : 0;
            }
        }

        const overallProgress =
            totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

        return {
            streak,
            totalScore,
            totalCompleted,
            overallProgress,
            levels,
        };
    }
}
