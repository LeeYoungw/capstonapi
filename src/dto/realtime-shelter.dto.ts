// dto/realtime-shelter-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ShelterItemDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;

  @ApiProperty()
  shelterTypeCode: number;

  @ApiProperty()
  shelterTypeName: string;
}

export class RealtimeShelterResponseDto {
  @ApiProperty({ example: 15, description: '반환된 대피소 개수' })
  count: number;

  @ApiProperty({ type: [String], description: '디버깅 로그' })
  log: string[];

  @ApiProperty({ type: [ShelterItemDto], description: '대피소 목록' })
  items: ShelterItemDto[];
}
