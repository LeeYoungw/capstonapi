// disaster-text-alert.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisasterTextAlert } from '../entity/disaster-text-alert.entity';
import { DisasterTextAlertService } from './disaster-text-alert.service';
import { DisasterTextAlertController } from './disaster-text-alert.controller'; // 선택사항

@Module({
  imports: [TypeOrmModule.forFeature([DisasterTextAlert])],
  providers: [DisasterTextAlertService],
  controllers: [DisasterTextAlertController], // 수동 호출용 사용 시
  exports: [DisasterTextAlertService],
})
export class DisasterTextAlertModule {}
