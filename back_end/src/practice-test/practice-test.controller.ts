import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PracticeTestService } from './practice-test.service';

@Controller('practice-test')
@UseGuards(AuthGuard('jwt'))
export class PracticeTestController {
  constructor(private readonly practiceTestService: PracticeTestService) {}

  @Get('questions')
  async getRandomQuestions(@Request() req) {
    return this.practiceTestService.getRandomMixedQuestions(50);
  }

  @Post('submit')
  async submitPracticeTest(@Body() body: any, @Request() req) {
    const userId = req.user.sub;
    return this.practiceTestService.submitPracticeTestSession({
      ...body,
      idUser: userId,
    });
  }

  @Get('history')
  async getPracticeHistory(@Request() req) {
    const userId = req.user.sub;
    return this.practiceTestService.getPracticeHistory(userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.sub;
    return this.practiceTestService.getUserStats(userId);
  }
}
