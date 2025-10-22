import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { Sequence, SequenceSchema } from './sequence.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sequence.name, schema: SequenceSchema }])],
  controllers: [SequencesController],
  providers: [SequencesService],
  exports: [MongooseModule],
})
export class SequencesModule {}
