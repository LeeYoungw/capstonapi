import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { AlertModule } from './alert/alert.module';
import { FcmModule } from './fcm/fcm.module';
import { ShelterModule } from './shelter/shelter.module';
import { DisasterTextAlertModule } from './alert/disaster-text-alert.module';
import { ScheduleModule } from '@nestjs/schedule'; // ✅ 추가
import './firebase/firebase-admin';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'sodksk12!@',
      database: 'capston',
      synchronize: false,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(), // ✅ 스케줄러 등록
    AuthModule,
    GroupModule,
    AlertModule,
    FcmModule,
    ShelterModule,
    DisasterTextAlertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
