import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ShelterService } from './shelter.service';
import { ShelterListResponseDto } from '../dto/shelter-list.dto';

@Controller('shelters')
@ApiTags('Shelters')
export class ShelterController {
  constructor(private readonly shelterService: ShelterService) {}

  @Get()
  @ApiOperation({ summary: '저장된 모든 대피소 조회' })
  @ApiOkResponse({ type: ShelterListResponseDto })
  async getAll(): Promise<ShelterListResponseDto> {
    return this.shelterService.listAllShelters();
  }
}