// src/user/dto/danger-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DangerMemberItemDto {
  @ApiProperty({ description: '사용자 UID' })
  id: string;

  @ApiProperty({ description: '이름' })
  name: string;
}

export class DangerMemberResponseDto {
  @ApiProperty({ description: '위험 상태 사용자 수' })
  count: number;

  @ApiProperty({ type: [DangerMemberItemDto], description: '위험 상태 사용자 목록' })
  items: DangerMemberItemDto[];
}
