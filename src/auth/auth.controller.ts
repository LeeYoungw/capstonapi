// src/controllers/auth.controller.ts
import {
  Controller, Get, Post, Body, Param, ParseIntPipe, BadRequestException, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam,
} from '@nestjs/swagger';
import { UpdateFcmTokenDto } from 'src/dto/update-fcm-token.dto';
import { User } from 'src/entity/user.entity';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { GetUser } from './get-user.decorator';

@ApiTags('Users')
@Controller('users')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: '전체 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록 반환' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID로 사용자 조회' })
  @ApiParam({ name: 'id', type: String, description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '해당 사용자 반환' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserById(@Param('id', ParseIntPipe) id: string) {
    return this.authService.getUserById(id);
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async register(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.register(email, password);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인 및 커스텀 토큰 반환' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: '로그인 성공 및 토큰 반환' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.login(email, password);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('token')
  @ApiOperation({ summary: 'FCM 토큰 등록' })
  async saveFcmToken(@Body() dto: UpdateFcmTokenDto, @GetUser('uid') uid: string) {
    await this.userRepo.update(uid, { fcmToken: dto.token });
    return { message: 'FCM 토큰이 저장되었습니다.' };
  }
}
