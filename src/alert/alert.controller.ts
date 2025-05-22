import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { LocationAlertDto } from '../dto/location-alert.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('location')
  @ApiOperation({ summary: '위험 지역 진입 알림 전파' })
  async sendLocationAlert(@GetUser('uid') uid: string, @Body() dto: LocationAlertDto) {
    await this.alertService.sendDangerAlert(uid, dto.message);
    return { message: '위험 알림 전송 완료' };
  }

  @Post('resolve')
  @ApiOperation({ summary: '위험 해제 알림 전파' })
  async sendResolveAlert(@GetUser('uid') uid: string) {
    await this.alertService.resolveDangerAlert(uid);
    return { message: '해제 알림 전송 완료' };
  }
}
