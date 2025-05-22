
// alert.module.ts
import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from '../entity/group-member.entity';
import { User } from '../entity/user.entity';
import { FcmModule } from '../fcm/fcm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMember, User]),
    FcmModule,
  ],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
