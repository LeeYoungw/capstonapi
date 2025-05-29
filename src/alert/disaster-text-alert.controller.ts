import { Controller, Get, Post, Query } from '@nestjs/common';
import { DisasterTextAlertService } from './disaster-text-alert.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('alerts/text')
@ApiTags('Disaster Text Alerts')
export class DisasterTextAlertController {
  constructor(private readonly alertService: DisasterTextAlertService) {}

  @Post('/sync')
  @ApiOperation({ summary: '공공재난문자 수동 동기화 실행' })
  async syncManually() {
    await this.alertService.fetchAndSaveAlerts();
    return { message: 'Disaster text alerts synced manually' };
  }

  @Get()
  @ApiOperation({ summary: '최신 재난 문자 목록 조회' })
  async getRecentAlerts(@Query('limit') limit = 10) {
    return this.alertService.getRecentAlerts(limit);
  }
}
