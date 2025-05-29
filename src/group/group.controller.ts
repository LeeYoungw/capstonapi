// src/controllers/group.controller.ts
import {
  Controller, Post, Body, Param, ParseIntPipe, Get, UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from 'src/dto/CreateGroup.dto';
import { GroupDetailResponseDto } from 'src/dto/response.dto/GroupDetailResponse.dto';
import { UserGroup } from 'src/entity/user-group.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JoinGroupDto } from 'src/dto/join-group.dto';
import { LocationShareResponseDto } from 'src/dto/response.dto/location-response.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { WithUidDto } from 'src/dto/with-uid.dto';
import { RespondInviteByUidDto } from 'src/dto/RespondInvite.dto';
@ApiTags('Groups')
// @ApiBearerAuth()
// @UseGuards(FirebaseAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: '그룹 생성' })
  @ApiResponse({ status: 201, description: '그룹 생성 성공' })
  async create(@Body() dto: CreateGroupDto) {
    return this.groupService.createGroup(dto.name, dto.uid);
  }

  @Get(':id')
  @ApiOperation({ summary: '그룹 상세 조회' })
  @ApiResponse({ status: 200, description: '그룹 정보 + 멤버 목록 반환', type: GroupDetailResponseDto })
  async getGroupDetail(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.getGroupDetail(id);
  }

  @Post('my')
  @ApiOperation({ summary: '내가 속한 그룹 목록 조회' })
  @ApiResponse({ status: 200, description: '그룹 목록 반환', type: [UserGroup] })
  async getMyGroups(@Body() dto: WithUidDto) {
    return this.groupService.getGroupsByUser(dto.uid);
  }


  @Post('/group-members/join')
@ApiOperation({ summary: '초대 코드 입력으로 그룹 참여 요청' })
@ApiResponse({ status: 201, description: '참여 요청 완료' })
async joinGroup(@Body() dto: JoinGroupDto) {
  await this.groupService.joinGroup(dto, dto.uid);
  return { message: '참여 요청 완료' };
}

@Post('/group-members/respond-by-uid')
@ApiOperation({ summary: '그룹장의 UID로 참여 요청 응답 (수락/거절)' })
async respondInviteByUid(@Body() dto: RespondInviteByUidDto) {
  await this.groupService.respondByLeaderUid(dto.uid, dto.targetUserId, dto.accept);
  return { message: dto.accept ? '수락 완료' : '거절 완료' };
}


  @Post('/group-members/:id/location-share-request')
  @ApiOperation({ summary: '위치 공유 요청 전송' })
  async requestShare(@Param('id', ParseIntPipe) id: number, @Body() dto: WithUidDto) {
    await this.groupService.requestLocationShare(id, dto.uid);
    return { message: '요청 완료' };
  }

  @Post('/group-members/:id/location-share-response')
  @ApiOperation({ summary: '위치 공유 요청 응답 (수락/거절)' })
  async respondShare(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LocationShareResponseDto,
  ) {
    await this.groupService.respondLocationShare(id, dto.uid, dto.accept);
    return { message: dto.accept ? '공유 수락됨' : '공유 거절됨' };
  }
  @Get(':groupId/locations')
@ApiOperation({ summary: '위치 공유 중인 그룹원들의 최근 위치 좌표 조회' })
async getMemberLocations(@Param('groupId') groupId: number) {
  return this.groupService.getGroupMemberLocations(groupId);
}

}