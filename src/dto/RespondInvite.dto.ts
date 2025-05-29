// dto/respond-invite-by-uid.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class RespondInviteByUidDto {
  @ApiProperty({ example: 'group-leader-uid', description: '그룹장 UID' })
  @IsString()
  uid: string;

  @ApiProperty({ example: 'cb3085d7-...', description: '참여 요청한 사용자 UID' })
  @IsString()
  targetUserId: string;

  @ApiProperty({ example: true, description: '수락 여부 (true: 수락, false: 거절)' })
  @IsBoolean()
  accept: boolean;
}
