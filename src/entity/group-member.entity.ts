// group-member.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserGroup } from './user-group.entity';
import { User } from './user.entity';

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'declined', 'left'],
    default: 'pending',
  })
  status: 'pending' | 'active' | 'declined' | 'left';

  @Column({ name: 'is_location_shared', default: false })
  isLocationShared: boolean;

  @ManyToOne(() => UserGroup)
  @JoinColumn({ name: 'group_id' })
  group: UserGroup;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}