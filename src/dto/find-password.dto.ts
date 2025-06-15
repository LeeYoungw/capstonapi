// src/user/dto/find-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class FindPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: '아이디(이메일)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '01012345678', description: '휴대폰 번호' })
  @IsPhoneNumber('KR', {
    message: '유효한 한국 휴대폰 번호여야 합니다. (예: +821012345678)'
  })
  phone: string;

  @ApiProperty({ example: '654321', description: '인증번호' })
  @IsString()
  code: string;
}
