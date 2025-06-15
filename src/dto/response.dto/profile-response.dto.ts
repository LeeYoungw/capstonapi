// src/user/dto/profile-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ description: '사용자 고유 ID (Firebase UID)' })
  id: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '생년월일 (YYYY-MM-DD)' })
  birthDate: string;

  @ApiProperty({ description: '이메일 (로그인 ID)' })
  email: string;

  @ApiProperty({ description: '휴대폰 번호', nullable: true })
  phone?: string;

  @ApiProperty({ description: '비상 연락처', nullable: true })
  emergencyContact?: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}
