import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(AuthGuard('jwt'))
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * GET /game/questions?level=newbie
   * Lấy danh sách câu hỏi game theo level
   * Query params:
   * - level: 'newbie' | 'basic' | 'advanced'
   * - count: số lượng câu hỏi (mặc định 30 câu cho 2 phút)
   * 
   * Response: Array<{
   *   id: string,
   *   level: string,
   *   question: string (label của câu hỏi),
   *   gifUrl: string (đường dẫn GIF),
   *   options: string[] (4 đáp án),
   *   correctAnswer: string
   * }>
   */
  @Get('questions')
  async getGameQuestions(
    @Query('level') level: 'newbie' | 'basic' | 'advanced',
    @Query('count') count?: number,
  ) {
    const questionCount = count ? parseInt(count.toString()) : 30;
    return this.gameService.getGameQuestions(level, questionCount);
  }

  /**
   * POST /game/submit
   * Submit kết quả game session
   * Body: {
   *   level: string,
   *   score: number,
   *   correctAnswers: number,
   *   totalQuestions: number,
   *   duration: number,
   *   answers: Array<{questionId, selectedAnswer, isCorrect}>
   * }
   */
  @Post('submit')
  async submitGameSession(@Body() body: any, @Request() req) {
    const userId = req.user.sub;
    return this.gameService.submitGameSession({
      ...body,
      idUser: userId,
    });
  }

  /**
   * GET /game/history?level=newbie
   * Lấy lịch sử game sessions
   */
  @Get('history')
  async getGameHistory(
    @Request() req,
    @Query('level') level?: 'newbie' | 'basic' | 'advanced',
  ) {
    const userId = req.user.sub;
    return this.gameService.getGameHistory(userId, level);
  }

  /**
   * GET /game/stats?level=newbie
   * Lấy stats theo level hoặc tổng quan
   */
  @Get('stats')
  async getGameStats(
    @Request() req,
    @Query('level') level?: 'newbie' | 'basic' | 'advanced',
  ) {
    const userId = req.user.sub;
    return this.gameService.getGameStats(userId, level);
  }

  /**
   * GET /game/leaderboard?level=newbie&limit=10
   * Lấy bảng xếp hạng theo level
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('level') level: 'newbie' | 'basic' | 'advanced',
    @Query('limit') limit?: number,
  ) {
    const topLimit = limit ? parseInt(limit.toString()) : 10;
    return this.gameService.getLeaderboard(level, topLimit);
  }
}
