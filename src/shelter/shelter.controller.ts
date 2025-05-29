// shelter.controller.ts
import { Controller, Get, Post, Query } from '@nestjs/common';
import { ShelterService } from './shelter.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('shelters')
@ApiTags('Shelters')
export class ShelterController {
  constructor(private readonly shelterService: ShelterService) {}

  @Post('/sync')
  @ApiOperation({ summary: '외부 API에서 대피소 데이터 수동 동기화' })
  async syncShelters() {
    await this.shelterService.syncSheltersFromAPI();
    return { message: 'Shelter sync triggered.' };
  }

  @Get()
  @ApiOperation({ summary: '대피소 목록 조회 (위경도 범위 필터링)' })
  async getShelters(
    @Query('startLat') startLat: number,
    @Query('endLat') endLat: number,
    @Query('startLng') startLng: number,
    @Query('endLng') endLng: number
  ) {
    return this.shelterService.getSheltersWithinBounds(startLat, endLat, startLng, endLng);
  }
}
