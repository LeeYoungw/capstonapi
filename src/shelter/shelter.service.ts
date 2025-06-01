import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Shelter } from '../entity/shelter.entity';
import axios from 'axios';

@Injectable()
export class ShelterService {
  private readonly logger = new Logger(ShelterService.name);
  private readonly API_URL = 'https://www.safetydata.go.kr/V2/api/DSSP-IF-10941';
  private readonly SERVICE_KEY = 'X5KLV0KY45V3CHBQ';

  constructor(
    @InjectRepository(Shelter)
    private shelterRepo: Repository<Shelter>,
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

      const items = data?.response?.body?.items?.item || [];
      if (!Array.isArray(items)) throw new Error('Invalid API response format');

      for (const item of items) {
        const existing = await this.shelterRepo.findOne({
          where: { name: item.REARE_NM, lat: +item.LAT, lng: +item.LOT },
        });

        const shelter = this.shelterRepo.create({
          name: item.REARE_NM,
          address: item.RONA_DADDR || '',
          lat: +item.LAT,
          lng: +item.LOT,
          shelterTypeCode: parseInt(item.SHLT_SE_CD),
          shelterTypeName: item.SHLT_SE_NM || '',
          mngSn: item.MNG_SN || null,
        });

        if (existing) {
          await this.shelterRepo.update(existing.id, shelter);
        } else {
          await this.shelterRepo.save(shelter);
        }
      }

      this.logger.log('✅ Shelter data synced successfully.');
    } catch (error) {
      this.logger.error('❌ Shelter sync failed:', error?.message || error);
    }
  }

  async getSheltersWithinBounds(
    startLat: number,
    endLat: number,
    startLng: number,
    endLng: number,
  ): Promise<
    {
      name: string;
      address: string;
      lat: number;
      lng: number;
      shelterTypeCode: number;
    }[]
  > {
    const shelters = await this.shelterRepo.find({
      where: {
        lat: Between(startLat, endLat),
        lng: Between(startLng, endLng),
      },
      order: { name: 'ASC' },
    });

    return shelters.map((s) => ({
      name: s.name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      shelterTypeCode: s.shelterTypeCode,
    }));
  }

async getRealtimeSheltersFromAPI(
  startLat: number,
  endLat: number,
  startLng: number,
  endLng: number,
): Promise<{
  items: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    shelterTypeCode: number;
    shelterTypeName: string;
  }[];
  log: string[];
}> {
  const log: string[] = [];

  try {
    const { data } = await axios.get(this.API_URL, {
      params: {
        serviceKey: this.SERVICE_KEY,
        returnType: 'json',
        numOfRows: 1000,
        pageNo: 1,
      },
    });

    this.logger.debug('📡 Raw API 응답 전체:', JSON.stringify(data, null, 2)); // <-- 이 줄
log.push(`📡 Raw API 응답 전체:\n${JSON.stringify(data, null, 2)}`);
    const items = data?.response?.body?.items?.item;

    if (!Array.isArray(items)) {
      const warn = '📭 API 응답 형식이 예상과 다릅니다.';
      this.logger.warn(warn, data);
      log.push(warn);
      return { items: [], log };
    }

    log.push(`📦 API에서 받은 전체 항목 수: ${items.length}`);
    this.logger.log(`📦 API에서 받은 전체 항목 수: ${items.length}`);

    log.push(`🎯 필터 기준: lat ${startLat}~${endLat}, lng ${startLng}~${endLng}`);
    this.logger.log(`🎯 필터 기준: lat ${startLat}~${endLat}, lng ${startLng}~${endLng}`);

    const parsed = items.map((item) => {
      const lat = Number(item.LAT);
      const lng = Number(item.LOT);

      if (isNaN(lat) || isNaN(lng)) {
        const warn = `⚠️ 잘못된 좌표: ${item.REARE_NM}, LAT: ${item.LAT}, LOT: ${item.LOT}`;
        this.logger.warn(warn);
        log.push(warn);
      }

      return {
        name: item.REARE_NM,
        address: item.RONA_DADDR || '',
        lat,
        lng,
        shelterTypeCode: Number(item.SHLT_SE_CD),
        shelterTypeName: item.SHLT_SE_NM || '',
      };
    });

    log.push(`🧾 파싱 완료 항목 수: ${parsed.length}`);
    this.logger.log(`🧾 파싱 완료 항목 수: ${parsed.length}`);

    const filtered = parsed.filter(
      (item) =>
        item.lat >= startLat &&
        item.lat <= endLat &&
        item.lng >= startLng &&
        item.lng <= endLng,
    );

    const filteredLog = `📍 최종 반환 shelter 수: ${filtered.length}`;
    this.logger.log(filteredLog);
    log.push(filteredLog);

    return { items: filtered, log };
  } catch (err) {
    const errorLog = '❌ 실시간 shelter API 조회 실패: ' + err.message;
    this.logger.error(errorLog);
    log.push(errorLog);
    return { items: [], log };
  }
}
}
