// src/user/dto/update-profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  IsDateString,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '홍길동', description: '이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: '생년월일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '010-1234-5678', description: '휴대폰 번호' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value), {
    toClassOnly: true,
  })
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자만 10~11자리여야 합니다.',
  })
  phone?: string;

  
}
