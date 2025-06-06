// shelter.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelter } from '../entity/shelter.entity';
import { ShelterService } from './shelter.service';
import { ShelterController } from './shelter.controller';
import { ShelterSyncService } from './sheltersync.service';
@Module({
  imports: [TypeOrmModule.forFeature([Shelter]),],
  controllers: [ShelterController],
  providers: [ShelterService,ShelterSyncService],
  exports: [ShelterService],
})
export class ShelterModule {}
