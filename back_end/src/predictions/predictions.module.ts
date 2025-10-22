import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { Prediction, PredictionSchema } from './prediction.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Prediction.name, schema: PredictionSchema }])],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
