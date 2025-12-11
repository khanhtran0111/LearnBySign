import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from './schemas/game-session.schema';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export interface GameQuestion {
  id: string;
  level: 'newbie' | 'basic' | 'advanced';
  question: string; // label
  gifUrl: string;
  options: string[]; // 4 đáp án
  correctAnswer: string;
  modelType: 'asl' | 'vsl';
}

@Injectable()
export class GameService {
  constructor(
    @InjectModel(GameSession.name)
    private gameSessionModel: Model<GameSession>,
  ) {}

  /**
   * Lấy câu hỏi game theo level
   * - Newbie: chữ cái A-Z, số 0-9
   * - Basic: từ vựng từ b1-b7
   * - Advanced: câu giao tiếp từ a1
   */
  async getGameQuestions(
    level: 'newbie' | 'basic' | 'advanced',
    count: number = 30,
  ): Promise<GameQuestion[]> {
    let lessonIds: string[] = [];
    
    // Xác định lesson IDs theo level
    switch (level) {
      case 'newbie':
        lessonIds = ['n1', 'n2', 'n3', 'n4']; // Chữ cái + số
        break;
      case 'basic':
        lessonIds = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']; // Từ vựng
        break;
      case 'advanced':
        lessonIds = ['a1']; // Câu giao tiếp
        break;
    }

    // Lấy tất cả contents từ các lessons
    const allContents: Array<{ label: string; videoUrl: string }> = [];
    
    for (const lessonId of lessonIds) {
      try {
        const response = await axios.get(`${BACKEND_URL}/lessons/by-custom-id/${lessonId}`);
        if (response.data?.contents) {
          allContents.push(...response.data.contents.map((c: any) => ({
            label: c.label,
            videoUrl: c.videoUrl,
          })));
        }
      } catch (error) {
        console.error(`Error loading lesson ${lessonId}:`, error);
      }
    }

    // Shuffle và chọn random
    const shuffled = this.shuffleArray(allContents);
    const selected = shuffled.slice(0, count);

    // Tạo câu hỏi trắc nghiệm với 4 đáp án
    const questions: GameQuestion[] = selected.map((content, idx) => {
      // Tạo 3 đáp án sai từ pool còn lại
      const wrongOptions = shuffled
        .filter(c => c.label !== content.label)
        .slice(0, 3)
        .map(c => c.label);

      // Mix correct answer vào vị trí random
      const allOptions = [content.label, ...wrongOptions];
      const shuffledOptions = this.shuffleArray(allOptions);

      return {
        id: `${level}_q${idx}`,
        level,
        question: content.label,
        gifUrl: content.videoUrl,
        options: shuffledOptions,
        correctAnswer: content.label,
        modelType: level === 'advanced' ? 'vsl' : 'asl',
      };
    });

    return questions;
  }

  /**
   * Submit game session
   */
  async submitGameSession(data: any) {
    const session = new this.gameSessionModel({
      idUser: data.idUser,
      level: data.level,
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
   * Lấy lịch sử game
   */
  async getGameHistory(userId: string, level?: string) {
    const filter: any = { idUser: userId };
    if (level) {
      filter.level = level;
    }

    return this.gameSessionModel
      .find(filter)
      .sort({ completedAt: -1 })
      .limit(20)
      .exec();
  }

  /**
   * Lấy stats game
   */
  async getGameStats(userId: string, level?: string) {
    const filter: any = { idUser: userId };
    if (level) {
      filter.level = level;
    }

    const sessions = await this.gameSessionModel.find(filter).exec();

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        bestScore: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        accuracy: 0,
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
   * Lấy bảng xếp hạng
   */
  async getLeaderboard(level: string, limit: number = 10) {
    const sessions = await this.gameSessionModel
      .find({ level })
      .sort({ score: -1 })
      .limit(limit)
      .populate('idUser', 'fullName email avatarUrl')
      .exec();

    return sessions.map((session, idx) => ({
      rank: idx + 1,
      user: session.idUser,
      score: session.score,
      correctAnswers: session.correctAnswers,
      totalQuestions: session.totalQuestions,
      completedAt: session.completedAt,
    }));
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
