import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from '../entity/group-member.entity';
import { User } from '../entity/user.entity';
import { FcmService } from '../fcm/fcm.service';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly memberRepo: Repository<GroupMember>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly fcmService: FcmService,
  ) {}

  async sendDangerAlert(senderId: string, message: string): Promise<void> {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const memberRecords = await this.memberRepo.find({
      where: { userId: senderId, status: 'active' },
    });

    for (const memberRecord of memberRecords) {
      const groupId = memberRecord.groupId;
      const members = await this.memberRepo.find({
        where: { groupId, status: 'active' },
        relations: ['user'],
      });

      for (const member of members) {
        if (member.userId === senderId || !member.isLocationShared) continue;

        const fcmToken = member.user?.fcmToken;
        if (fcmToken) {
          try {
            await this.fcmService.sendNotification(
              fcmToken,
              '⚠️ 위험 알림',
              `${sender?.username || '사용자'}님이 위험 지역에 진입했습니다.\n메시지: ${message}`
            );
          } catch (error) {
            console.error(`FCM 전송 실패 (userId: ${member.userId}):`, error);
          }
        }
      }
    }
  }

  async resolveDangerAlert(senderId: string): Promise<void> {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const memberRecords = await this.memberRepo.find({
      where: { userId: senderId, status: 'active' },
    });

    for (const memberRecord of memberRecords) {
      const groupId = memberRecord.groupId;
      const members = await this.memberRepo.find({
        where: { groupId, status: 'active' },
        relations: ['user'],
      });

      for (const member of members) {
        if (member.userId === senderId || !member.isLocationShared) continue;

        const fcmToken = member.user?.fcmToken;
        if (fcmToken) {
          try {
            await this.fcmService.sendNotification(
              fcmToken,
              ' 안전 확인',
              `${sender?.username || '사용자'}님이 안전한 상태로 확인되었습니다.`
            );
          } catch (error) {
            console.error(`FCM 전송 실패 (userId: ${member.userId}):`, error);
          }
        }
      }
    }
  }
}
