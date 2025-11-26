import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

import { MediaService } from '../media/media.service';

@Injectable()
export class LessonsService {
    constructor(
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        private mediaService: MediaService,
    ) { }

    async create(createLessonDto: any): Promise<Lesson> {
        const createdLesson = new this.lessonModel(createLessonDto);
        return createdLesson.save();
    }

    async findAll(difficulty?: string): Promise<Lesson[]> {
        const filter = difficulty ? { difficulty } : {};
        return this.lessonModel.find(filter).exec();
    }

    async findOne(id: string): Promise<Lesson> {
        const lesson = await this.lessonModel.findById(id).exec();
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }
        return lesson;
    }

    async findByCustomId(customId: string): Promise<Lesson> {
        const lesson = await this.lessonModel.findOne({ customId }).exec();
        if (!lesson) {
            throw new NotFoundException(`Lesson with customId ${customId} not found`);
        }
        return lesson;
    }

    async update(id: string, updateLessonDto: any): Promise<Lesson> {
        const updatedLesson = await this.lessonModel
            .findByIdAndUpdate(id, updateLessonDto, { new: true })
            .exec();
        if (!updatedLesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }
        return updatedLesson;
    }

    async remove(id: string): Promise<Lesson> {
        const deletedLesson = await this.lessonModel.findByIdAndDelete(id).exec();
        if (!deletedLesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }
        return deletedLesson;
    }

    async syncLessonsFromSupabase(): Promise<any> {
        try {
            const folders = [
                { path: '01_Alphabet_Numbers/gifs', difficulty: 'newbie', category: 'Chữ cái & Số' },
                { path: '02_Simple_Words/gifs', difficulty: 'basic', category: 'Từ vựng cơ bản' },
                { path: '03_Complex_Words/gifs', difficulty: 'advanced', category: 'Từ vựng phức tạp' },
                { path: '04_Advanced/gifs', difficulty: 'advanced', category: 'Giao tiếp nâng cao' },
            ];

            let totalSynced = 0;
            const results: any[] = [];

            for (const folder of folders) {
                console.log(`Syncing folder: ${folder.path}...`);
                try {
                    const files = await this.mediaService.listFiles(folder.path);

                    for (const file of files) {
                        // Clean filename
                        // Remove extension
                        let cleanName = file.name.replace(/\.[^/.]+$/, "");
                        // Remove prefix numbers like "0_", "1_"
                        cleanName = cleanName.replace(/^\d+_/, "");
                        // Replace underscores with spaces
                        cleanName = cleanName.replace(/_/g, " ");
                        // Capitalize first letter
                        cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

                        const lessonData = {
                            title: cleanName,
                            description: folder.category,
                            difficulty: folder.difficulty,
                            mediaUrl: file.publicUrl,
                            folder: folder.path
                        };

                        await this.lessonModel.updateOne(
                            { mediaUrl: file.publicUrl },
                            { $set: lessonData },
                            { upsert: true }
                        );
                        totalSynced++;
                    }
                    results.push({ folder: folder.path, count: files.length, status: 'success' });
                } catch (err) {
                    console.error(`Error syncing folder ${folder.path}:`, err);
                    results.push({ folder: folder.path, error: err.message, status: 'failed' });
                }
            }

            console.log(`Sync completed. Total lessons synced: ${totalSynced}`);
            return { totalSynced, details: results };
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    }
}
