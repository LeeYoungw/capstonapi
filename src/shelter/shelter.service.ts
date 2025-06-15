// src/shelter/shelter.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {
  RealtimeShelterItemDto,
  RealtimeShelterResponseDto,
} from '../dto/realtime-shelter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShelterListResponseDto,ShelterItemDto } from 'src/dto/shelter-list.dto';
import { Shelter } from '../entity/shelter.entity';
import { Repository } from 'typeorm';
@Injectable()
export class ShelterService {
  private readonly logger = new Logger(ShelterService.name);
  private readonly API_URL = 'https://www.safetydata.go.kr/V2/api/DSSP-IF-10941';
  private readonly SERVICE_KEY = 'X5KLV0KY45V3CHBQ';
   constructor(
    @InjectRepository(Shelter)
    private readonly shelterRepo: Repository<Shelter>,
  ) {}


  
  async getRealtimeShelters(
    startLat: number,
    endLat: number,
    startLng: number,
    endLng: number,
  ): Promise<RealtimeShelterResponseDto> {
    const log: string[] = [];

    // 1) 외부 API 호출 (바운드 파라미터 포함!)
    let rawItems: any[];
    try {
      const resp = await axios.get(this.API_URL, {
        params: {
          serviceKey: this.SERVICE_KEY,
          returnType: 'json',
          numOfRows: 1000,
          pageNo: 1,
          startLat,
          endLat,
          // 주의: API 문서에 맞춰서 startLot/endLot 키 사용
          startLot: startLng,
          endLot: endLng,
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0', 
        },
      });
      log.push('✅ 외부 API 호출 성공');
      
      // 2) resp.data.body 가 바로 배열로 온다
      rawItems = Array.isArray(resp.data.body) ? resp.data.body : [];
      log.push(`원본 항목 수: ${rawItems.length}`);
    } catch (err) {
      this.logger.error('❌ 실시간 API 호출 실패', err.stack || err);
      throw new HttpException(
        '실시간 shelter API 호출 실패',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // 3) DTO 변환
    const items: RealtimeShelterItemDto[] = rawItems.map((i) => ({
      name: i.REARE_NM,
      address: i.RONA_DADDR || '',
      lat: Number(i.LAT),
      lng: Number(i.LOT),
      shelterTypeCode: Number(i.SHLT_SE_CD),
      shelterTypeName: i.SHLT_SE_NM || '',
    }));

    log.push(`최종 반환 개수: ${items.length}`);

    return {
      count: items.length,
      items,
      log,
    };
  }

   async listAllShelters(): Promise<ShelterListResponseDto> {
    const entities = await this.shelterRepo.find({ order: { name: 'ASC' } });
    const items: ShelterItemDto[] = entities.map((e) => ({
      name: e.name,
      address: e.address,
      lat: e.lat,
      lng: e.lng,
      shelterTypeCode: e.shelterTypeCode,
      shelterTypeName: e.shelterTypeName,
      mngSn: e.mngSn,
    }));
    return {
      count: items.length,
      items,
    };
}
}
