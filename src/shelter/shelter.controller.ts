import { Controller, Get, Post, Query, BadRequestException } from '@nestjs/common';
import { ShelterService } from './shelter.service';
import { ApiOperation, ApiTags, ApiQuery, ApiResponse,ApiOkResponse } from '@nestjs/swagger';
import { RealtimeShelterResponseDto } from 'src/dto/realtime-shelter.dto';

@Controller('shelters')
@ApiTags('Shelters')
export class ShelterController {
  constructor(private readonly shelterService: ShelterService) {}

  @Post('/sync')
  @ApiOperation({ summary: '외부 API에서 대피소 데이터 동기화' })
  async syncShelters() {
    await this.shelterService.syncSheltersFromAPI();
    return { message: '✅ Shelter sync completed' };
  }
@Get('realtime')
@ApiOperation({ summary: '공공데이터 포털에서 실시간 대피소 목록 및 로그 반환' })
@ApiQuery({ name: 'startLat', type: Number, required: true })
@ApiQuery({ name: 'endLat', type: Number, required: true })
@ApiQuery({ name: 'startLng', type: Number, required: true })
@ApiQuery({ name: 'endLng', type: Number, required: true })
@ApiOkResponse({
  description: '조회된 대피소 목록과 로그를 반환합니다.',
  type: RealtimeShelterResponseDto,
})
async getRealtimeShelters(
  @Query('startLat') startLatRaw: string | number,
  @Query('endLat') endLatRaw: string | number,
  @Query('startLng') startLngRaw: string | number,
  @Query('endLng') endLngRaw: string | number,
): Promise<RealtimeShelterResponseDto> {
  const startLat = Number(startLatRaw);
  const endLat = Number(endLatRaw);
  const startLng = Number(startLngRaw);
  const endLng = Number(endLngRaw);

  if ([startLat, endLat, startLng, endLng].some((v) => isNaN(v))) {
    throw new BadRequestException('📌 잘못된 좌표 값입니다.');
  }

  const { items, log } = await this.shelterService.getRealtimeSheltersFromAPI(
    startLat,
    endLat,
    startLng,
    endLng,
  );

  return {
    count: items.length,
    items,
    log,
  };
}
  }

