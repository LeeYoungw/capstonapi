// dto/group-detail-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GroupMemberDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  status: 'pending' | 'active' | 'declined' | 'left';

  @ApiProperty()
  isLocationShared: boolean;
}

export class GroupDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  inviteCode: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: [GroupMemberDto] })
  members: GroupMemberDto[];
}
