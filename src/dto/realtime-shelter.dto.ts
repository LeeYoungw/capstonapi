// src/shelter/dto/realtime-shelter.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RealtimeShelterItemDto {
  @ApiProperty({ description: '대피소명' })
  name: string;

  @ApiProperty({ description: '주소' })
  address: string;

  @ApiProperty({ description: '위도' })
  lat: number;

  @ApiProperty({ description: '경도' })
  lng: number;

  @ApiProperty({ description: '대피소 유형 코드' })
  shelterTypeCode: number;

  @ApiProperty({ description: '대피소 유형 명칭' })
  shelterTypeName: string;
}

export class RealtimeShelterResponseDto {
  @ApiProperty({ description: '총 개수' })
  count: number;

  @ApiProperty({ type: [RealtimeShelterItemDto], description: '조회된 대피소 목록' })
  items: RealtimeShelterItemDto[];

  @ApiProperty({ type: [String], description: '디버그·로그 메시지' })
  log: string[];
}

