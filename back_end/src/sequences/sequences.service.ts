import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sequence, SequenceDocument } from './sequence.schema';
import { CreateSequenceDto } from './dto/create-sequence.dto';

@Injectable()
export class SequencesService {
  constructor(@InjectModel(Sequence.name) private model: Model<SequenceDocument>) {}

  create(dto: CreateSequenceDto) { return this.model.create(dto); }
  findOne(id: string) { return this.model.findById(id).lean(); }
}
