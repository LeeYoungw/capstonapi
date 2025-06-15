import { ApiProperty } from '@nestjs/swagger';

export class ShelterItemDto {
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

  @ApiProperty({ description: '관리 번호 (MNG_SN)', required: false })
  mngSn?: string;
}

export class ShelterListResponseDto {
  @ApiProperty({ description: '총 대피소 수' })
  count: number;

  @ApiProperty({ type: [ShelterItemDto], description: '저장된 모든 대피소 목록' })
  items: ShelterItemDto[];
}
