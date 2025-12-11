import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { SignRecognitionModule } from './sign-recognition/sign-recognition.module';
import { PracticeTestModule } from './practice-test/practice-test.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        uri: cs.get<string>('MONGODB_URI'),
        dbName: cs.get<string>('DB_NAME') || 'learnbysign',
        serverSelectionTimeoutMS: 10000
      })
    }),
    UsersModule,
    AuthModule,
    MediaModule,
    LessonsModule,
    ProgressModule,
    SignRecognitionModule,
    PracticeTestModule,
    GameModule,
  ]
})
export class AppModule { }
