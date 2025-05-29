// dto/create-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: '우리 가족', description: '그룹 이름' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: 'test-user-123', description: '사용자 UID (테스트용)' })
  @IsString()
  uid: string;
}