import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { AlertModule } from './alert/alert.module';
import { FcmModule } from './fcm/fcm.module';
import * as admin from 'firebase-admin';
import { join } from 'path';
import './firebase/firebase-admin';


@Module({
  imports: [
    AuthModule, // Auth 모듈 추가
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // MySQL 서버 주소
      port: 3306, // MySQL 기본 포트
      username: 'root', // MySQL 계정
      password: 'sodksk12!@', // MySQL 비밀번호
      database: 'capston', // 사용할 데이터베이스명
      synchronize: false, // 기존 테이블 유지
      autoLoadEntities: true, // 엔티티 자동 로드
    }),
    AuthModule,
    GroupModule,      
    AlertModule,      
    FcmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

