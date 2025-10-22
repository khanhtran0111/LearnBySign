import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly svc: PredictionsService) {}

  @Post() create(@Body() dto: CreatePredictionDto) { return this.svc.create(dto); }

  @Get('top1-stats')
  top1(@Query('days') days = '7') {
    const d = parseInt(days, 10);
    const since = new Date(Date.now() - d * 24 * 3600 * 1000);
    return this.svc.top1CountsSince(since);
  }
}
