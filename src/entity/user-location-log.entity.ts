import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_location_logs')
export class UserLocationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.locationLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('float')
  x: number;

  @Column('float')
  y: number;

  @Column('float')
  z: number;

  @CreateDateColumn({ name: 'timestamp', type: 'datetime' })
  timestamp: Date;
}
