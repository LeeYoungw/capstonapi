// dto/join-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({ example: 'ABC123', description: '초대 코드' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'test-user-123', description: '사용자 UID (테스트용)' })
  @IsString()
  uid: string;
}