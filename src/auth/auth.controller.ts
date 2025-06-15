// src/controllers/auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdateFcmTokenDto } from 'src/dto/update-fcm-token.dto';
import { User } from 'src/entity/user.entity';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { GetUser } from './get-user.decorator';
import { RegisterDto } from 'src/dto/register.dto';
import { FindIdDto } from 'src/dto/find-id.dto';
import { FindPasswordDto } from 'src/dto/find-password.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';

@ApiTags('Users')
@Controller('users')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: '전체 사용자 조회' })
  @ApiResponse({ status: 200, type: [User], description: '사용자 목록 반환' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID로 사용자 조회' })
  @ApiParam({ name: 'id', type: String, description: '사용자 UID' })
  @ApiResponse({ status: 200, type: User, description: '해당 사용자 반환' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserById(@Param('id') id: string) {
    const user = await this.authService.getUserById(id);
    if (!user) throw new BadRequestException('사용자를 찾을 수 없습니다.');
    return user;
  }

 // src/controllers/auth.controller.ts
@Post('register')
@ApiOperation({ summary: '회원가입' })
@ApiBody({ type: RegisterDto })
@ApiResponse({ status: 201, type: User, description: '회원가입 성공' })
@ApiResponse({ status: 400, description: '검증 실패' })
async register(@Body() dto: RegisterDto) {
  const { password, confirmPassword } = dto;
  if (password !== confirmPassword) {
    throw new BadRequestException('비밀번호가 일치하지 않습니다.');
  }

  // birthYear/Month/Day → "YYYY-MM-DD"
  const mm = String(dto.birthMonth).padStart(2, '0');
  const dd = String(dto.birthDay).padStart(2, '0');
  const birthDate = `${dto.birthYear}-${mm}-${dd}`;

  // 서비스에는 confirmPassword, birthYear/Month/Day 대신 birthDate로 넘기기
  const { confirmPassword: _, birthYear, birthMonth, birthDay, ...rest } = dto;
  return this.authService.register({
    ...rest,
    birthDate,
  });
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
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호를 입력하세요.');
    }
    return this.authService.login(email, password);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('token')
  @ApiOperation({ summary: 'FCM 토큰 등록' })
  @ApiResponse({ status: 200, description: 'FCM 토큰이 저장되었습니다.' })
  async saveFcmToken(
    @Body() dto: UpdateFcmTokenDto,
    @GetUser('uid') uid: string,
  ) {
    await this.authService.saveFcmToken(uid, dto.token);
    return { message: 'FCM 토큰이 저장되었습니다.' };
  }


  //  @UseGuards(FirebaseAuthGuard)
  @Patch(':id/confirm-safe')
  @ApiOperation({ summary: '대피 성공 시 안전 상태로 업데이트' })
  @ApiParam({ name: 'id', description: '사용자 UID' })
  @ApiOkResponse({ description: '안전 상태로 업데이트 완료' })
  @ApiNotFoundResponse({ description: '사용자를 찾을 수 없음' })
  async confirmSafe(@Param('id') id: string): Promise<{ message: string }> {
    await this.authService.confirmSafe(id);
    return { message: '사용자가 안전 상태로 표시되었습니다.' };
  }

  @Post('find-id')
  @ApiOperation({ summary: '아이디(이메일) 찾기' })
  @ApiBody({ type: FindIdDto })
  @ApiOkResponse({ schema: { example: { email: 'user@example.com' } } })
  @ApiBadRequestResponse()
  async findId(@Body() dto: FindIdDto) {
    return this.authService.findId(dto);
  }

  @Post('find-password')
  @ApiOperation({ summary: '비밀번호 찾기 요청' })
  @ApiBody({ type: FindPasswordDto })
  @ApiOkResponse({ schema: { example: { canReset: true } } })
  async findPassword(@Body() dto: FindPasswordDto) {
    return this.authService.verifyPasswordRequest(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: '비밀번호 재설정 완료' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}
