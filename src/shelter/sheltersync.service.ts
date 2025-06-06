// shelter/shelter-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShelterService } from './shelter.service';

@Injectable()
export class ShelterSyncService {
  private readonly logger = new Logger(ShelterSyncService.name);

  constructor(private readonly shelterService: ShelterService) {}

  // ⏱ 매일 오전 4시에 자동 동기화
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleDailySync() {
    this.logger.log('🕓 [CRON] 매일 새벽 4시: Shelter 동기화 시작');
    await this.shelterService.syncSheltersFromAPI();
    this.logger.log('✅ [CRON] Shelter 동기화 완료');
  }
}
