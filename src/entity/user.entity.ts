import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Building } from './building.entity'; // 외래키 참조 시 필요

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @Column({nullable : true})
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'emergency_contact', nullable: true })
  emergencyContact: string;

  @Column({ type: 'double', name: 'last_gps_lat', nullable: true })
  lastGpsLat: number;

  @Column({ type: 'double', name: 'last_gps_lng', nullable: true })
  lastGpsLng: number;

  @Column({ default: false })
  isSafe: boolean;

  @Column({ nullable: true })
  currentFloor: number;

  @Column({ nullable: true })
  currentBuildingId: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'fcm_token', type:'varchar', length: 255, nullable: true })
fcmToken: string | null;

  // Optional: 관계 맵핑 (현재 건물 정보)
  @ManyToOne(() => Building)
  @JoinColumn({ name: 'currentBuildingId' })
  currentBuilding: Building;
}
