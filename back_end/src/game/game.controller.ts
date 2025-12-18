import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(AuthGuard('jwt'))
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('questions')
  async getGameQuestions(
    @Query('level') level: 'newbie' | 'basic' | 'advanced',
    @Query('count') count?: number,
  ) {
    const questionCount = count ? parseInt(count.toString()) : 30;
    return this.gameService.getGameQuestions(level, questionCount);
  }

  @Post('submit')
  async submitGameSession(@Body() body: any, @Request() req) {
    const userId = req.user.sub;
    return this.gameService.submitGameSession({
      ...body,
      idUser: userId,
    });
  }

  @Get('history')
  async getGameHistory(
    @Request() req,
    @Query('level') level?: 'newbie' | 'basic' | 'advanced',
  ) {
    const userId = req.user.sub;
    return this.gameService.getGameHistory(userId, level);
  }

  @Get('stats')
  async getGameStats(
    @Request() req,
    @Query('level') level?: 'newbie' | 'basic' | 'advanced',
  ) {
    const userId = req.user.sub;
    return this.gameService.getGameStats(userId, level);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('level') level: 'newbie' | 'basic' | 'advanced',
    @Query('limit') limit?: number,
  ) {
    const topLimit = limit ? parseInt(limit.toString()) : 10;
    return this.gameService.getLeaderboard(level, topLimit);
  }
}
