import { Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 전체 사용자 조회
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 특정 사용자 조회 (ID 기반)
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 회원가입 (비밀번호 해싱 후 저장)
  async register(email: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('이미 사용 중인 이메일입니다.');

    try {
      const firebaseUid = uuidv4();

      await admin.auth().createUser({ uid: firebaseUid, email, password });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        id: firebaseUid,
        email,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      return savedUser;
    }
    
      catch(error){
        console.error('[회원가입 오류]', error); 
        throw new InternalServerErrorException('회원가입 중 오류가 발생했습니다.');
      }
    }
  // 커스텀 토큰 생성
  async generateCustomToken(uid: string): Promise<string> {
    try {
      return await admin.auth().createCustomToken(uid);
    } catch (error) {
      throw new InternalServerErrorException(`Firebase 토큰 생성 실패: ${error.message}`);
    }
  }

  // 로그인 (Firebase 커스텀 토큰 사용)
  async login(email: string, password: string): Promise<{ customToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('이메일이 존재하지 않습니다.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');

    try {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
      return { customToken };
    } catch (error) {
      throw new InternalServerErrorException(`Firebase 처리 오류: ${error.message}`);
    }
  }
}
