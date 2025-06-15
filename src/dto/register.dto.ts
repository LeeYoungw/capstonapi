// src/user/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  confirmPassword: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1990, description: '출생 연도 (YYYY)' })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear: number;

  @ApiProperty({ example: 1, description: '출생 월 (1–12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth: number;

  @ApiProperty({ example: 15, description: '출생 일 (1–31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  birthDay: number;

  @ApiProperty({ example: '010-1234-5678' })
  @IsPhoneNumber('KR', {
    message: '유효한 한국 휴대폰 번호여야 합니다.',
  })
  phone: string;


}
