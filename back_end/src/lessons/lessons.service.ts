import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Progress, ProgressDocument } from '../progress/schemas/progress.schema';
import { MediaService } from '../media/media.service';

@Injectable()
export class LessonsService {
    constructor(
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
        private mediaService: MediaService,
    ) { }

    async create(createLessonDto: any): Promise<Lesson> {
        const createdLesson = new this.lessonModel(createLessonDto);
        return createdLesson.save();
    }

    async findAll(difficulty?: string): Promise<Lesson[]> {
        const filter = difficulty ? { difficulty } : {};
        // Có thể sort theo customId để bài học hiển thị đúng thứ tự n1, n2...
        return this.lessonModel.find(filter).sort({ customId: 1 }).exec();
    }

    async findOne(id: string): Promise<Lesson> {
        if (!mongoose.isValidObjectId(id)) {
            throw new BadRequestException(`ID "${id}" không đúng định dạng MongoDB ObjectId`);
        }
        const lesson = await this.lessonModel.findById(id).exec();
        if (!lesson) {
            throw new NotFoundException(`Không tìm thấy bài học với ID: ${id}`);
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

    // --- ĐÃ XÓA HÀM syncLessonsFromSupabase CŨ TẠI ĐÂY ---

    /**
     * LOGIC MỚI: Sync contents cho các bài học đã có trong DB
     */
    async syncLessonContents(): Promise<any> {
        const results: any[] = [];

        // Mapping customId -> file range trong folder
        const lessonFolderMapping: Record<string, { folder: string; fileFilter?: (name: string) => boolean }> = {
            // Bài 1: Chữ A-H (Lấy các file a.gif -> h.gif)
            n1: {
                folder: '01_Alphabet_Numbers/gifs',
                fileFilter: (name) => /^[a-h][\._]/i.test(name) || /^[a-h]$/i.test(name.replace(/\.[^/.]+$/, '')),
            },
            // Bài 2: Chữ I-P
            n2: {
                folder: '01_Alphabet_Numbers/gifs',
                fileFilter: (name) => /^[i-p][\._]/i.test(name) || /^[i-p]$/i.test(name.replace(/\.[^/.]+$/, '')),
            },
            // Bài 3: Chữ Q-Z
            n3: {
                folder: '01_Alphabet_Numbers/gifs',
                fileFilter: (name) => /^[q-z][\._]/i.test(name) || /^[q-z]$/i.test(name.replace(/\.[^/.]+$/, '')),
            },
            // Bài 4: Số 0-9
            n4: {
                folder: '01_Alphabet_Numbers/gifs',
                fileFilter: (name) => /^\d[\._]/.test(name) || /^\d$/.test(name.replace(/\.[^/.]+$/, '')),
            },
        };

        try {
            // Chỉ lấy những bài học có customId (tức là bài học được tạo từ seed)
            const lessons = await this.lessonModel.find({ customId: { $exists: true } }).exec();

            for (const lesson of lessons) {
                const mapping = lesson.customId ? lessonFolderMapping[lesson.customId] : undefined;

                // Nếu bài học không nằm trong danh sách mapping (VD: bài practice p1, p2...), bỏ qua
                if (!mapping) {
                    continue;
                }

                try {
                    const allFiles = await this.mediaService.listFiles(mapping.folder);

                    // Filter files theo mapping
                    const filteredFiles = mapping.fileFilter
                        ? allFiles.filter((f) => mapping.fileFilter!(f.name))
                        : allFiles;

                    // Tạo contents array
                    const contents = filteredFiles.map((file) => this.createContentFromFile(file));
                    
                    // Sắp xếp contents theo label (A, B, C...)
                    contents.sort((a, b) => a.label.localeCompare(b.label, 'en', { numeric: true }));

                    // Update lesson với contents mới
                    await this.lessonModel.updateOne(
                        { _id: lesson._id },
                        { $set: { contents, questionCount: contents.length } },
                    );

                    results.push({
                        lessonId: lesson._id,
                        customId: lesson.customId,
                        title: lesson.title,
                        contentsCount: contents.length,
                        status: 'success',
                    });
                } catch (err) {
                    results.push({
                        lessonId: lesson._id,
                        customId: lesson.customId,
                        error: err.message,
                        status: 'failed',
                    });
                }
            }

            const successCount = results.filter((r) => r.status === 'success').length;
            return {
                message: 'Sync Contents Completed',
                totalLessons: results.length,
                successCount,
                details: results,
            };
        } catch (error) {
            console.error('Sync contents failed:', error);
            throw error;
        }
    }

    /**
     * Mapping tên file Telex -> Ký tự tiếng Việt có dấu
     */
    private readonly VIETNAMESE_LABEL_MAPPING: Record<string, string> = {
        aw: 'Ă',
        aa: 'Â',
        dd: 'Đ',
        ee: 'Ê',
        oo: 'Ô',
        ow: 'Ơ',
        uw: 'Ư',
    };

    /**
     * Lấy tất cả lessons kèm trạng thái isLocked dựa trên tiến độ user
     * Logic: 
     * - Newbie lessons: Bài đầu unlock, các bài sau phải hoàn thành bài trước
     * - Basic lessons: Phải hoàn thành TẤT CẢ Newbie (n1-n4)
     * - Advanced lessons: Phải hoàn thành TẤT CẢ Basic (b1-b7)
     */
    async getLessonsWithProgress(userId: string, difficulty?: string): Promise<any[]> {
        // 1. Lấy tất cả lessons
        const filter = difficulty ? { difficulty } : {};
        const allLessons = await this.lessonModel.find(filter).sort({ customId: 1 }).exec();

        // 2. Lấy progress của user
        const userProgress = await this.progressModel.find({ idUser: userId }).exec();
        const completedLessonIds = new Set(
            userProgress
                .filter(p => p.completed)
                .map(p => p.idLesson.toString())
        );

        // 3. Nhóm lessons theo difficulty
        const newbieLessons = allLessons.filter(l => l.difficulty === 'newbie' && l.type === 'lesson').sort((a, b) => (a.customId || '').localeCompare(b.customId || ''));
        const basicLessons = allLessons.filter(l => l.difficulty === 'basic' && l.type === 'lesson').sort((a, b) => (a.customId || '').localeCompare(b.customId || ''));
        const advancedLessons = allLessons.filter(l => l.difficulty === 'advanced' && l.type === 'lesson').sort((a, b) => (a.customId || '').localeCompare(b.customId || ''));

        // 4. Check điều kiện unlock
        const allNewbieCompleted = newbieLessons.every(l => completedLessonIds.has(l._id.toString()));
        const allBasicCompleted = basicLessons.every(l => completedLessonIds.has(l._id.toString()));

        // 5. Gắn trạng thái isLocked cho từng lesson
        const lessonsWithLock = allLessons.map((lesson, index, array) => {
            const lessonObj = lesson.toObject();
            let isLocked = false;

            if (lesson.type === 'practice') {
                // Practice lessons không bị lock
                isLocked = false;
            } else if (lesson.difficulty === 'newbie') {
                // Newbie: Bài đầu unlock, các bài sau cần hoàn thành bài trước
                const lessonIndex = newbieLessons.findIndex(l => l._id.toString() === lesson._id.toString());
                if (lessonIndex === 0) {
                    isLocked = false;
                } else {
                    const prevLesson = newbieLessons[lessonIndex - 1];
                    isLocked = !completedLessonIds.has(prevLesson._id.toString());
                }
            } else if (lesson.difficulty === 'basic') {
                // Basic: Phải hoàn thành TẤT CẢ Newbie
                if (!allNewbieCompleted) {
                    isLocked = true;
                } else {
                    // Nếu đã hoàn thành Newbie, check tuần tự trong Basic
                    const lessonIndex = basicLessons.findIndex(l => l._id.toString() === lesson._id.toString());
                    if (lessonIndex === 0) {
                        isLocked = false;
                    } else {
                        const prevLesson = basicLessons[lessonIndex - 1];
                        isLocked = !completedLessonIds.has(prevLesson._id.toString());
                    }
                }
            } else if (lesson.difficulty === 'advanced') {
                // Advanced: Phải hoàn thành TẤT CẢ Basic
                if (!allBasicCompleted) {
                    isLocked = true;
                } else {
                    // Nếu đã hoàn thành Basic, check tuần tự trong Advanced
                    const lessonIndex = advancedLessons.findIndex(l => l._id.toString() === lesson._id.toString());
                    if (lessonIndex === 0) {
                        isLocked = false;
                    } else {
                        const prevLesson = advancedLessons[lessonIndex - 1];
                        isLocked = !completedLessonIds.has(prevLesson._id.toString());
                    }
                }
            }

            return {
                ...lessonObj,
                isLocked,
                isCompleted: completedLessonIds.has(lesson._id.toString()),
            };
        });

        return lessonsWithLock;
    }

    private createContentFromFile(file: { name: string; publicUrl: string }): {
        label: string;
        description: string;
        videoUrl: string;
        thumbnailUrl?: string;
    } {
        // Bước 1: Lấy tên file raw (bỏ đuôi .gif, .mp4...)
        const rawName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();

        // Bước 2: Kiểm tra xem tên file có trong mapping Telex không
        let label: string;
        if (this.VIETNAMESE_LABEL_MAPPING[rawName]) {
            // Trường hợp CÓ: Gán label bằng ký tự tiếng Việt tương ứng
            label = this.VIETNAMESE_LABEL_MAPPING[rawName];
        } else {
            // Trường hợp KHÔNG: Giữ nguyên logic cũ
            const numMatch = rawName.match(/^(\d+)_/);
            if (numMatch) {
                label = numMatch[1];
            } else if (rawName.length === 1) {
                label = rawName.toUpperCase();
            } else if (/^\d+$/.test(rawName)) {
                // Số thuần (0, 1, 2...)
                label = rawName;
            } else {
                // Tên dài: replace underscore và capitalize
                label = rawName.replace(/_/g, ' ');
                label = label.charAt(0).toUpperCase() + label.slice(1);
            }
        }

        return {
            label,
            description: `Mô tả cho ${label}`,
            videoUrl: file.publicUrl,
            thumbnailUrl: undefined,
        };
    }
}