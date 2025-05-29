// shelter.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shelter } from '../entity/shelter.entity';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { Between } from 'typeorm'; 

@Injectable()
export class ShelterService {
  private readonly logger = new Logger(ShelterService.name);
  private readonly API_URL = 'https://www.safetydata.go.kr/openApi/service/rest/DSSP-IF-10941';
  private readonly SERVICE_KEY = process.env.SAFETYDATA_KEY;

  constructor(
    @InjectRepository(Shelter)
    private shelterRepo: Repository<Shelter>
  ) {}

  async syncSheltersFromAPI(): Promise<void> {
    try {
      const { data } = await axios.get(this.API_URL, {
        params: {
          serviceKey: this.SERVICE_KEY,
          returnType: 'json',
          numOfRows: 1000,
          pageNo: 1,
        },
      });

      const items = data?.response?.body?.items || [];
      if (!Array.isArray(items)) throw new Error('Invalid API response format');

      for (const item of items) {
        const existing = await this.shelterRepo.findOne({ where: { name: item.REARE_NM, lat: +item.LAT, lng: +item.LOT } });

        const shelter = this.shelterRepo.create({
          name: item.REARE_NM,
          lat: +item.LAT,
          lng: +item.LOT,
          address: item.RONA_DADDR,
          available_for: [parseInt(item.SHLT_SE_CD)],
        });

        if (existing) {
          await this.shelterRepo.update(existing.id, shelter);
        } else {
          await this.shelterRepo.save(shelter);
        }
      }
      this.logger.log(' Shelter data synced successfully.');
    } catch (error) {
      this.logger.error('🚨 Shelter sync failed:', error);
    }
  }

  async getSheltersWithinBounds(
  startLat: number,
  endLat: number,
  startLng: number,
  endLng: number,
): Promise<Shelter[]> {
  return this.shelterRepo.find({
    where: {
      lat: Between(startLat, endLat),
      lng: Between(startLng, endLng),
    },
    order: { name: 'ASC' },
  });
}
}