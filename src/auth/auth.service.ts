// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../entity/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { FindIdDto } from 'src/dto/find-id.dto';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';
import { ResetPasswordDto} from 'src/dto/reset-password.dto';
import { FindPasswordDto } from 'src/dto/find-password.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
 private normalizePhone(phone: string): string {
    // 숫자만
    let digits = phone.replace(/\D/g, '');
    // 한국 로컬 포맷 가정: 01012341234 → +821012341234
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = '82' + digits.slice(1);
    }
    // 반드시 + 붙이기
    if (!digits.startsWith('+')) {
      digits = '+' + digits;
    }
    return digits;
  }

  private normalizeLocalPhone(e164: string): string {
    // 1) 숫자만 남기기
    let digits = e164.replace(/\D/g, '');
    // 2) 한국(+82) 코드 제거하고, 앞에 0 붙이기
    if (digits.startsWith('82')) {
      digits = '0' + digits.substring(2);
    }
    // 3) 하이픈 넣기: 01012345678 → 010-1234-5678
    const m = digits.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
    // 포맷이 안 맞을 땐 원본 숫자 리턴
    return digits;
  }
  /** 전체 사용자 조회 */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /** ID로 사용자 조회 */
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  /**
   * 회원가입
   * @param data RegisterDto에서 confirmPassword를 뺀 형태
   */
  async register(
  data: Omit<RegisterDto, 'confirmPassword' | 'birthYear' | 'birthMonth' | 'birthDay'> & { birthDate: string },
): Promise<User> {
  const { email, name, birthDate, phone, password } = data;

    if (await this.userRepository.findOne({ where: { email } })) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const firebaseUid = uuidv4();
    try {
      // Firebase에 보낼 객체를 준비
      const createArgs: admin.auth.CreateRequest = {
        uid: firebaseUid,
        email,
        password,
        displayName: name,
      };
      // phone이 있으면 E.164로 변환 후 삽입
      if (phone) {
        createArgs.phoneNumber = this.normalizePhone(phone);
      }

      await admin.auth().createUser(createArgs);
    } catch (err: any) {
      console.error('[Firebase 생성 오류]', err);
      // 인증 서버 쪽 메시지를 그대로 던지기보단 사용자용 메시지로 래핑
      throw new InternalServerErrorException('외부 인증 서버 오류: ' + err.message);
    }

    // DB 저장
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        id: firebaseUid,
        email,
        password: hashed,
        name,
        birthDate,
        phone,
      });
      return await this.userRepository.save(user);
    } catch (err) {
      console.error('[DB 저장 오류]', err);
      throw new InternalServerErrorException('회원정보 저장 중 오류가 발생했습니다.');
    }
  }
  /** 로그인 */
  async login(email: string, password: string): Promise<{ uid: string }> {
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) throw new UnauthorizedException('이메일이 존재하지 않습니다.');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');

  
  return { uid: user.id };
}
 /** 아이디 찾기: 휴대폰 일치 시 이메일 반환 */
  async findId(dto: FindIdDto): Promise<{ email: string }> {
    // TODO: dto.code 검증 로직 추가
    const localPhone = this.normalizeLocalPhone(dto.phone);
    const user = await this.userRepository.findOne({
      where: { phone: localPhone },
    });
    if (!user) {
      throw new NotFoundException('해당 번호로 가입된 계정이 없습니다.');
    }
    return { email: user.email };
  }
  /** 비밀번호 찾기 요청: 이메일+전화번호 확인 */
  async verifyPasswordRequest(dto: FindPasswordDto): Promise<{ canReset: boolean }> {
    // TODO: dto.code 검증 로직 추가
     const localPhone = this.normalizeLocalPhone(dto.phone);
    const user = await this.userRepository.findOne({ where: { email: dto.email, phone: localPhone } });
    if (!user) throw new NotFoundException('이메일과 전화번호가 일치하지 않습니다.');
    return { canReset: true };
  }

  /** 비밀번호 재설정 */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 1) Firebase Auth 비밀번호 업데이트
    try {
      await admin.auth().updateUser(user.id, { password: dto.newPassword });
    } catch (err) {
      console.error('[Firebase 비밀번호 업데이트 오류]', err);
      throw new InternalServerErrorException('인증 서버 비밀번호 업데이트 실패');
    }

    // 2) DB 비밀번호 해싱 후 저장
    try {
      user.password = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepository.save(user);
    } catch (err) {
      console.error('[DB 비밀번호 저장 오류]', err);
      throw new InternalServerErrorException('비밀번호 저장 중 오류가 발생했습니다.');
    }
  }

  /** 프로필 조회 */
  async getProfile(uid: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  /** 프로필 정보 수정 */
  async updateProfile(uid: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.preload({ id: uid, ...dto });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return this.userRepository.save(user);
  }
  /**
   * FCM 토큰 저장
   */
  async saveFcmToken(uid: string, token: string): Promise<void> {
    const result = await this.userRepository.update(uid, { fcmToken: token });
    if (result.affected === 0) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }

    async confirmSafe(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    user.isSafe = true;
    await this.userRepository.save(user);
  }
}
