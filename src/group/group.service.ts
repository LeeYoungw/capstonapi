// group.service.ts
import { Injectable,NotFoundException,BadRequestException, ForbiddenException,ConflictException } from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository, In  } from 'typeorm';
import { UserGroup } from '../entity/user-group.entity';
import { GroupMember } from '../entity/group-member.entity';
import { randomBytes } from 'crypto';
import { GroupDetailResponseDto } from 'src/dto/response.dto/GroupDetailResponse.dto';
import { JoinGroupDto } from 'src/dto/join-group.dto';
import { FcmService } from 'src/fcm/fcm.service';
import { User } from 'src/entity/user.entity';
import { UserLocationLog } from 'src/entity/user-location-log.entity';
@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly groupRepo: Repository<UserGroup>,

    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,
    @InjectRepository(User)
private readonly userRepo: Repository<User>,
    private readonly fcmService: FcmService,

    @InjectRepository(UserLocationLog)
    private readonly locationRepo: Repository<UserLocationLog>,
  ) {}

  async createGroup(name: string, userId: string): Promise<UserGroup> {
    const inviteCode = randomBytes(3).toString('hex').toUpperCase(); // 6자리 초대코드
    const group = this.groupRepo.create({
      name,
      createdBy: userId,
      inviteCode,
    });
    const savedGroup = await this.groupRepo.save(group);

    const member = this.memberRepo.create({
      groupId: savedGroup.id,
      userId,
      status: 'active',
    });
    await this.memberRepo.save(member);

    return savedGroup;
  }
  async getGroupDetail(groupId: number): Promise<GroupDetailResponseDto> {
  const group = await this.groupRepo.findOne({
    where: { id: groupId },
    relations: ['members'],
  });

  if (!group) {
    throw new NotFoundException('그룹을 찾을 수 없습니다.');
  }

  const members = await this.memberRepo.find({
    where: { groupId },
  });

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    createdBy: group.createdBy,
    members: members.map((m) => ({
      userId: m.userId,
      status: m.status,
      isLocationShared: m.isLocationShared,
    })),
  };
}
    // group.service.ts
async getGroupsByUser(userId: string): Promise<UserGroup[]> {
  const memberships = await this.memberRepo.find({
    where: { userId, status: 'active' },
  });

  const groupIds = memberships.map((m) => m.groupId);

  if (groupIds.length === 0) return [];

  return this.groupRepo.find({
  where: { id: In(groupIds) },
  order: { createdAt: 'DESC' },
});
}


async joinGroup(dto: JoinGroupDto, userId: string): Promise<void> {
  const group = await this.groupRepo.findOne({ where: { inviteCode: dto.code } });

  if (!group) {
    throw new NotFoundException('존재하지 않는 초대코드입니다.');
  }

  const existing = await this.memberRepo.findOne({
    where: { groupId: group.id, userId },
  });

  if (existing && existing.status !== 'left') {
    throw new ConflictException('이미 이 그룹에 참여 중입니다.');
  }

  if (existing && existing.status === 'left') {
    // 다시 참여 요청으로 전환
    existing.status = 'pending';
    await this.memberRepo.save(existing);
  } else {
    const newMember = this.memberRepo.create({
      groupId: group.id,
      userId,
      status: 'pending',
    });
    await this.memberRepo.save(newMember);
  }
}


async respondByLeaderUid(leaderUid: string, targetUserId: string, accept: boolean): Promise<void> {
  const group = await this.groupRepo.findOne({ where: { createdBy: leaderUid } });
  if (!group) throw new NotFoundException('해당 그룹장 UID로 된 그룹이 없습니다.');

  const member = await this.memberRepo.findOne({
    where: { groupId: group.id, userId: targetUserId },
  });

  if (!member) throw new NotFoundException('해당 유저의 참여 요청을 찾을 수 없습니다.');
  if (member.status === 'active') throw new ConflictException('이미 참여한 사용자입니다.');
  if (member.status === 'declined') throw new ConflictException('이미 거절된 요청입니다.');

  member.status = accept ? 'active' : 'declined';
  await this.memberRepo.save(member);
}

async acceptGroupInvite(memberId: number, leaderId: string): Promise<void> {
  const member = await this.memberRepo.findOne({
    where: { id: memberId },
    relations: ['group'],
  });

  if (!member) throw new NotFoundException('초대 정보를 찾을 수 없습니다.');
  if (member.status === 'active') throw new ConflictException('이미 그룹에 참여 중입니다.');
  if (member.status === 'declined') throw new ConflictException('이미 거절된 요청입니다.');

  const group = member.group;
  if (!group) throw new NotFoundException('그룹 정보를 찾을 수 없습니다.');
  if (group.createdBy !== leaderId) {
    throw new ForbiddenException('그룹장만 수락할 수 있습니다.');
  }

  member.status = 'active';
  await this.memberRepo.save(member);
}


async declineGroupInvite(memberId: number, leaderId: string): Promise<void> {
  const member = await this.memberRepo.findOne({
    where: { id: memberId },
    relations: ['group'],
  });

  if (!member) throw new NotFoundException('초대 정보를 찾을 수 없습니다.');
  if (member.status === 'active') throw new ConflictException('이미 그룹에 참여 중입니다.');
  if (member.status === 'declined') throw new ConflictException('이미 거절된 요청입니다.');

  const group = member.group;
  if (!group) throw new NotFoundException('그룹 정보를 찾을 수 없습니다.');
  if (group.createdBy !== leaderId) {
    throw new ForbiddenException('그룹장만 거절할 수 있습니다.');
  }

  member.status = 'declined';
  await this.memberRepo.save(member);
}


async requestLocationShare(memberId: number, requesterId: string): Promise<void> {
  const target = await this.memberRepo.findOne({ where: { id: memberId } });
  if (!target) throw new NotFoundException('대상을 찾을 수 없습니다.');

  const sameGroup = await this.memberRepo.findOne({
    where: { groupId: target.groupId, userId: requesterId, status: 'active' },
  });
  if (!sameGroup) throw new ForbiddenException('같은 그룹 멤버만 요청할 수 있습니다.');

  const sender = await this.userRepo.findOne({ where: { id: requesterId } });
  const targetUser = await this.userRepo.findOne({ where: { id: target.userId } });

  if (targetUser?.fcmToken) {
    try {
      await this.fcmService.sendNotification(
        targetUser.fcmToken,
        '위치 공유 요청',
        `${sender?.username || '사용자'}님이 위치 공유를 요청했습니다.`
      );
    } catch (error) {
      console.error(`FCM 전송 실패 (요청 대상: ${target.userId}):`, error);
    }
  }
}

async respondLocationShare(memberId: number, userId: string, accept: boolean): Promise<void> {
  const target = await this.memberRepo.findOne({
    where: { id: memberId },
    relations: ['group', 'user'],
  });
  if (!target) throw new NotFoundException('대상을 찾을 수 없습니다.');
  if (target.userId !== userId) throw new ForbiddenException('본인의 요청만 응답할 수 있습니다.');

  target.isLocationShared = accept;
  await this.memberRepo.save(target);

  // 이전 요청자 중 가장 최근 요청자를 특정하려면 별도 필드 도입 필요
  const groupMembers = await this.memberRepo.find({
    where: { groupId: target.groupId, status: 'active' },
    relations: ['user'],
  });

  const requester = groupMembers.find(m => m.userId !== userId); // 한 명만 가정

  if (requester?.user?.fcmToken) {
    try {
      await this.fcmService.sendNotification(
        requester.user.fcmToken,
        accept ? ' 위치 공유 수락됨' : ' 위치 공유 거절됨',
        `${target.user?.username || '상대방'}님이 위치 공유 요청을 ${accept ? '수락' : '거절'}했습니다.`
      );
    } catch (error) {
      console.error(`FCM 전송 실패 (알림 대상: ${requester.userId}):`, error);
    }
  }
}

 // 위치 공유 중인 그룹원들의 최근 위치 조회
  async getGroupMemberLocations(groupId: number): Promise<
    {
      userId: string;
      username: string;
      x: number;
      y: number;
      z: number;
      timestamp: Date;
    }[]
  > {
    // 1. 해당 그룹의 위치 공유 중인 멤버 가져오기
    const sharedMembers = await this.memberRepo.find({
      where: { groupId, status: 'active', isLocationShared: true },
      relations: ['user'],
    });

    if (sharedMembers.length === 0) return [];

    // 2. 각 사용자별로 가장 최신 위치 로그 가져오기
   const result: {
  userId: string;
  username: string;
  x: number;
  y: number;
  z: number;
  timestamp: Date;
}[] = [];

for (const member of sharedMembers) {
  const latestLog = await this.locationRepo.findOne({
    where: { userId: member.userId },
    order: { timestamp: 'DESC' },
  });

  if (latestLog) {
    result.push({
      userId: member.userId,
      username: member.user.username,
      x: latestLog.x,
      y: latestLog.y,
      z: latestLog.z,
      timestamp: latestLog.timestamp,
    });
  }
}
    return result;
  }
}

