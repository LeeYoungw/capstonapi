// dto/location-alert.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LocationAlertDto {
  @ApiProperty({ example: '위험 지역에 진입했습니다.' })
  @IsString()
  message: string;
}
