import { IsString, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class TK {
  @IsString() label: string;
  @IsNumber() @Min(0) @Max(1) p: number;
}

export class CreatePredictionDto {
  @IsString() sequenceId: string;
  @IsString() modelId: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => TK) topk: TK[];
}
