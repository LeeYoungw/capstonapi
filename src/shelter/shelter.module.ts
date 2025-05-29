// shelter.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelter } from '../entity/shelter.entity';
import { ShelterService } from './shelter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shelter])],
  providers: [ShelterService],
  exports: [ShelterService],
})
export class ShelterModule {}
