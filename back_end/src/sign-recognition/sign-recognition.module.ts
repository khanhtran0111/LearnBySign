import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignRecognitionController } from './sign-recognition.controller';
import { SignRecognitionService } from './sign-recognition.service';

@Module({
  imports: [ConfigModule],
  controllers: [SignRecognitionController],
  providers: [SignRecognitionService],
  exports: [SignRecognitionService],
})
export class SignRecognitionModule {}
