// disaster-text-alert.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisasterTextAlert } from '../entity/disaster-text-alert.entity';
import { DisasterTextAlertService } from './disaster-text-alert.service';
import { DisasterTextAlertController } from './disaster-text-alert.controller'; 

@Module({
  imports: [TypeOrmModule.forFeature([DisasterTextAlert])],
  providers: [DisasterTextAlertService],
  controllers: [DisasterTextAlertController], 
  exports: [DisasterTextAlertService],
})
export class DisasterTextAlertModule {}
