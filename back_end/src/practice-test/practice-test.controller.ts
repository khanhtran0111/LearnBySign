import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PracticeTestService } from './practice-test.service';

@Controller('practice-test')
@UseGuards(AuthGuard('jwt'))
export class PracticeTestController {
  constructor(private readonly practiceTestService: PracticeTestService) {}

  /**
   * GET /practice-test/questions
   * Lấy danh sách câu hỏi random mix từ 2 nhóm:
   * - Nhóm 1: A-Z, 0-9 (ASL)
   * - Nhóm 2: 60 câu tiếng Việt (VSL)
   * 
   * Query params:
   * - count: số lượng câu hỏi (mặc định 50 câu cho 2 phút)
   */
  @Get('questions')
  async getRandomQuestions(@Request() req) {
    return this.practiceTestService.getRandomMixedQuestions(50);
  }

  /**
   * POST /practice-test/submit
   * Submit kết quả session luyện tập
   * Body: {
   *   idUser: string,
   *   score: number,
   *   correctAnswers: number,
   *   totalQuestions: number,
   *   duration: number (seconds),
   *   answers: Array<{questionId, userAnswer, isCorrect}>
   * }
   */
  @Post('submit')
  async submitPracticeTest(@Body() body: any, @Request() req) {
    const userId = req.user.sub;
    return this.practiceTestService.submitPracticeTestSession({
      ...body,
      idUser: userId,
    });
  }

  /**
   * GET /practice-test/history
   * Lấy lịch sử các session luyện tập của user
   */
  @Get('history')
  async getPracticeHistory(@Request() req) {
    const userId = req.user.sub;
    return this.practiceTestService.getPracticeHistory(userId);
  }

  /**
   * GET /practice-test/stats
   * Lấy thống kê tổng quan (best score, average, total sessions)
   */
  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.sub;
    return this.practiceTestService.getUserStats(userId);
  }
}
