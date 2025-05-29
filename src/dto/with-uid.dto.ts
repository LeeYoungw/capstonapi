import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WithUidDto {
  @ApiProperty({ example: 'test-user-123', description: '사용자 UID (테스트용)' })
  @IsString()
  uid: string;
}
