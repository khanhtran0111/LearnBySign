import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PracticeTestController } from './practice-test.controller';
import { PracticeTestService } from './practice-test.service';
import { PracticeTestSession, PracticeTestSessionSchema } from './schemas/practice-test-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PracticeTestSession.name, schema: PracticeTestSessionSchema },
    ]),
  ],
  controllers: [PracticeTestController],
  providers: [PracticeTestService],
  exports: [PracticeTestService],
})
export class PracticeTestModule {}
