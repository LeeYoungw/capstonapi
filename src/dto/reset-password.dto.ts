// src/user/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: '아이디(이메일)' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, description: '새 비밀번호' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ minLength: 8, description: '비밀번호 확인' })
  @IsString()
  @MinLength(8)
  confirmPassword: string;
}
