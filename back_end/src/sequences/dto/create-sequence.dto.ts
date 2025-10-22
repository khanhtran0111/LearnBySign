// src/sequences/dto/create-sequence.dto.ts
import { IsString, IsInt, Min, IsOptional, IsObject, IsDefined } from 'class-validator';

export class CreateSequenceDto {
  @IsString() sessionId: string;
  @IsInt() @Min(0) tStartMs: number;
  @IsInt() @Min(0) tEndMs: number;
  @IsOptional() @IsString() label?: string;

  @IsDefined()
  @IsObject()
  keypoints: Record<string, any>;
}
