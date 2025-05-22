// dto/location-share-response.dto.ts
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocationShareResponseDto {
  @ApiProperty({ example: true, description: '공유 수락 여부' })
  @IsBoolean()
  accept: boolean;
}
