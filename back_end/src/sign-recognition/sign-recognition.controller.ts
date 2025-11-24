import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Logger,
} from '@nestjs/common';
import { SignRecognitionService } from './sign-recognition.service';
import {
  PredictFromLandmarksDto,
  PredictFromFeaturesDto,
  SmoothedPredictionResult,
} from './dto/sign-recognition.dto';

@Controller('api/sign')
export class SignRecognitionController {
  private readonly logger = new Logger(SignRecognitionController.name);

  constructor(
    private readonly signRecognitionService: SignRecognitionService,
  ) {}

  @Get('health')
  async healthCheck() {
    return await this.signRecognitionService.healthCheck();
  }

  @Post('predict')
  @HttpCode(HttpStatus.OK)
  async predict(@Body() dto: PredictFromLandmarksDto) {
    this.logger.debug(`Received prediction request: ${dto.handed} hand`);
    return await this.signRecognitionService.predictFromLandmarks(dto);
  }

  @Post('predict/landmarks')
  @HttpCode(HttpStatus.OK)
  async predictFromLandmarks(@Body() dto: PredictFromLandmarksDto) {
    return await this.signRecognitionService.predictFromLandmarks(dto);
  }

  @Post('predict/features')
  @HttpCode(HttpStatus.OK)
  async predictFromFeatures(@Body() dto: PredictFromFeaturesDto) {
    return await this.signRecognitionService.predictFromFeatures(dto);
  }

  @Post('predict/smooth')
  @HttpCode(HttpStatus.OK)
  async predictWithSmoothing(
    @Query('sessionId') sessionId: string,
    @Body() dto: PredictFromLandmarksDto | PredictFromFeaturesDto,
  ): Promise<SmoothedPredictionResult> {
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return await this.signRecognitionService.predictWithSmoothing(
      sessionId,
      dto,
    );
  }

  @Delete('session/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetSession(@Param('sessionId') sessionId: string) {
    this.signRecognitionService.resetSession(sessionId);
  }
}
