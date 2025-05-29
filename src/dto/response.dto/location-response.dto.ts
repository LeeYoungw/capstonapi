// dto/location-share-response.dto.ts
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WithUidDto } from '../with-uid.dto';
export class LocationShareResponseDto extends WithUidDto {
  @ApiProperty({ example: true, description: '공유 수락 여부' })
  @IsBoolean()
  accept: boolean;
}
