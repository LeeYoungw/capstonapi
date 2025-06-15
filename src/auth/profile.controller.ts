// src/controllers/profile.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { GetUser } from './get-user.decorator';
import { ProfileResponseDto } from '../dto/response.dto/profile-response.dto';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(FirebaseAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

   @Get()
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiOkResponse({ type: ProfileResponseDto })
  async getProfile(@GetUser('uid') uid: string): Promise<ProfileResponseDto> {
    return this.authService.getProfile(uid);
  }

  @Patch()
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiOkResponse({ type: ProfileResponseDto })
  async updateProfile(
    @GetUser('uid') uid: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.authService.updateProfile(uid, dto);
  }
}
