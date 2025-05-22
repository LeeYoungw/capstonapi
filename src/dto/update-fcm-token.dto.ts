// dto/update-fcm-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({ example: 'fcm_token_string_here' })
  @IsString()
  token: string;
}