import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entity/user.entity';
import { Building } from '../entity/building.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Building]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // 환경변수 처리 권장
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule, AuthService], // 👈 다른 모듈에서 사용 가능하도록 export
})
export class AuthModule {}

