import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';

@Controller('sequences')
export class SequencesController {
  constructor(private readonly svc: SequencesService) {}

  @Post() create(@Body() dto: CreateSequenceDto) { return this.svc.create(dto); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.findOne(id); }
}
