// disaster-text-alert.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'; // 👈 추가
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterTextAlert } from '../entity/disaster-text-alert.entity';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DisasterTextAlertService implements OnModuleInit { // 👈 implements 추가
  private readonly logger = new Logger(DisasterTextAlertService.name);
  private readonly API_URL = 'https://www.safetydata.go.kr/V2/api/DSSP-IF-00247';
  private readonly SERVICE_KEY = '5AFE71AGZ920QV43';

  constructor(
    @InjectRepository(DisasterTextAlert)
    private readonly alertRepo: Repository<DisasterTextAlert>,
  ) {}

  async onModuleInit() {
    this.logger.log('⏳ 서버 시작 시 재난 문자 자동 동기화 시작');
    await this.fetchAndSaveAlerts();
  }

  async fetchAndSaveAlerts(): Promise<void> {
    try {
      const { data } = await axios.get(this.API_URL, {
        params: {
          serviceKey: this.SERVICE_KEY,
          numOfRows: 100,
          pageNo: 1,
          returnType: 'json',
        },
      });

      const items = data?.body || []; 
      if (!Array.isArray(items)) throw new Error('Invalid alert API response format');

      for (const item of items) {
        const exists = await this.alertRepo.findOne({
          where: { msgId: item.SN.toString() },
        });
        if (exists) continue;

        const alert = this.alertRepo.create({
          msgId: item.SN.toString(),
          sender: item.DST_SE_NM || '미상',
          content: item.MSG_CN,
          locationName: item.RCPTN_RGN_NM || '',
          receivedAt: new Date(item.CRT_DT),
        });

        await this.alertRepo.save(alert);
      }

      this.logger.log('🚨 재난 문자 데이터 동기화 완료');
    } catch (error) {
      this.logger.error('🚨 재난 문자 API 처리 실패:', error?.message || error);
    }
  }

  async getRecentAlerts(limit: number = 10): Promise<DisasterTextAlert[]> {
    return this.alertRepo.find({
      order: { receivedAt: 'DESC' },
      take: limit,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyDisasterAlertSync() {
    await this.fetchAndSaveAlerts();
  }
}
