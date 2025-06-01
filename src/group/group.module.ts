import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { UserGroup } from '../entity/user-group.entity';
import { GroupMember } from '../entity/group-member.entity';
import { User } from '../entity/user.entity';
import { FcmModule } from '../fcm/fcm.module';
import { AuthModule } from '../auth/auth.module'; // 👈 JwtService 사용을 위해 import
import { UserLocationLog } from 'src/entity/user-location-log.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserGroup, GroupMember, User,UserLocationLog]),
    FcmModule,
    AuthModule, 
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}

