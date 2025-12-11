import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PracticeTestSession } from './schemas/practice-test-session.schema';

// Danh sách 60 câu tiếng Việt (VSL.h5)
const VSL_SENTENCES = [
  'ban dang lam gi', 'ban di dau the', 'ban hieu ngon ngu ky hieu khong',
  'ban hoc lop may', 'ban khoe khong', 'ban muon gio roi', 'ban phai canh giac',
  'ban ten la gi', 'ban tien bo day', 'ban trong cau co the',
  'bo me toi cung la nguoi Diec', 'cai nay bao nhieu tien', 'cai nay la cai gi',
  'cam on', 'cap cuu', 'chuc mung', 'chung toi giao tiep voi nhau bang ngon ngu ky hieu',
  'con yeu me', 'cong viec cua ban la gi', 'hen gap lai cac ban', 'mon nay khong ngon',
  'toi bi chong mat', 'toi bi cuop', 'toi bi dau dau', 'toi bi dau hong',
  'toi bi ket xe', 'toi bi lac', 'toi bi phan biet doi xu', 'toi cam thay rat hoi hop',
  'toi cam thay rat vui', 'toi can an sang', 'toi can di ve sinh', 'toi can gap bac si',
  'toi can phien dich', 'toi can thuoc', 'toi dang an sang', 'toi dang buon',
  'toi dang o ben xe', 'toi dang o cong vien', 'toi dang phai cach ly', 'toi dang phan van',
  'toi di sieu thi', 'toi di toi Ha Noi', 'toi doc kem', 'toi khoi benh roi',
  'toi khong dem theo tien', 'toi khong hieu', 'toi khong quan tam', 'toi la hoc sinh',
  'toi la nguoi Diec', 'toi la tho theu', 'toi lam viec o cua hang', 'toi nham dia chi',
  'toi song o Ha Noi', 'toi thay doi bung', 'toi thay nho ban', 'toi thich an mi',
  'toi thich phim truyen', 'toi viet kem', 'xin chao'
];

// Danh sách chữ cái và số (ASL)
const ASL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ASL_DIGITS = '0123456789'.split('');

export interface Question {
  id: string;
  type: 'asl' | 'vsl'; // asl = chữ/số, vsl = câu tiếng Việt
  label: string; // Nội dung câu hỏi
  modelType: 'asl_landmarks_best.joblib' | 'VSL.h5';
}

@Injectable()
export class PracticeTestService {
  constructor(
    @InjectModel(PracticeTestSession.name)
    private practiceTestSessionModel: Model<PracticeTestSession>,
  ) {}

  /**
   * Tạo câu hỏi mix random từ 2 nhóm
   * - 50% ASL (chữ cái + số)
   * - 50% VSL (câu tiếng Việt)
   */
  getRandomMixedQuestions(count: number = 50): Question[] {
    const questions: Question[] = [];
    
    // Tạo pool câu hỏi ASL (chữ cái + số)
    const aslPool: Question[] = [
      ...ASL_LETTERS.map((letter, idx) => ({
        id: `asl_letter_${idx}`,
        type: 'asl' as const,
        label: letter,
        modelType: 'asl_landmarks_best.joblib' as const,
      })),
      ...ASL_DIGITS.map((digit, idx) => ({
        id: `asl_digit_${idx}`,
        type: 'asl' as const,
        label: digit,
        modelType: 'asl_landmarks_best.joblib' as const,
      })),
    ];

    // Tạo pool câu hỏi VSL (câu tiếng Việt)
    const vslPool: Question[] = VSL_SENTENCES.map((sentence, idx) => ({
      id: `vsl_sentence_${idx}`,
      type: 'vsl' as const,
      label: sentence,
      modelType: 'VSL.h5' as const,
    }));

    // Mix 50-50 hoặc theo tỷ lệ tùy chỉnh
    const aslCount = Math.floor(count / 2);
    const vslCount = count - aslCount;

    // Random lấy từ mỗi pool
    const selectedAsl = this.shuffleArray([...aslPool]).slice(0, aslCount);
    const selectedVsl = this.shuffleArray([...vslPool]).slice(0, vslCount);

    // Merge và shuffle lần cuối
    questions.push(...selectedAsl, ...selectedVsl);
    return this.shuffleArray(questions);
  }

  /**
   * Submit kết quả session
   */
  async submitPracticeTestSession(data: any) {
    const session = new this.practiceTestSessionModel({
      idUser: data.idUser,
      score: data.score,
      correctAnswers: data.correctAnswers,
      totalQuestions: data.totalQuestions,
      duration: data.duration,
      answers: data.answers,
      completedAt: new Date(),
    });

    return session.save();
  }

  /**
   * Lấy lịch sử các session
   */
  async getPracticeHistory(userId: string) {
    return this.practiceTestSessionModel
      .find({ idUser: userId })
      .sort({ completedAt: -1 })
      .limit(20)
      .exec();
  }

  /**
   * Lấy stats tổng quan
   */
  async getUserStats(userId: string) {
    const sessions = await this.practiceTestSessionModel
      .find({ idUser: userId })
      .exec();

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        bestScore: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
      };
    }

    const bestScore = Math.max(...sessions.map(s => s.score));
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);

    return {
      totalSessions: sessions.length,
      bestScore,
      averageScore: Math.round(averageScore),
      totalCorrect,
      totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    };
  }

  /**
   * Utility: shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
