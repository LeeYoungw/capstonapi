// dto/join-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({ example: 'ABC123', description: '초대 코드 (대문자 6자리)' })
  @IsString()
  @Length(6, 16)
  code: string;
}
