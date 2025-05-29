import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterTextAlert } from '../entity/disaster-text-alert.entity';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertService } from './alert.service';
@Injectable()
export class DisasterTextAlertService {
  private readonly logger = new Logger(DisasterTextAlertService.name);
  private readonly API_URL = 'https://www.safetydata.go.kr/openApi/service/rest/DISF-2301';
  private readonly SERVICE_KEY = process.env.SAFETYDATA_ALERT_KEY;

  constructor(
    @InjectRepository(DisasterTextAlert)
    private readonly alertRepo: Repository<DisasterTextAlert>,
  ) {}



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

      const items = data?.response?.body?.items || [];
      if (!Array.isArray(items)) throw new Error('Invalid alert API response format');

      for (const item of items) {
        const exists = await this.alertRepo.findOne({ where: { msgId: item.md101_sn } });
        if (exists) continue;

        const alert = this.alertRepo.create({
          msgId: item.md101_sn,
          sender: item.md101_org,
          content: item.md101_content,
          locationName: item.location_name || '',
          receivedAt: new Date(item.md101_time),
        });

        await this.alertRepo.save(alert);
      }

      this.logger.log('🚨 재난 문자 데이터 동기화 완료');
    } catch (error) {
      this.logger.error('🚨 재난 문자 API 처리 실패:', error);
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

