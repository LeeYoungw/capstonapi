import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Building } from './building.entity';
import { UserLocationLog } from './user-location-log.entity';

@Entity('users')
export class User {
  /** Firebase UID */
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  /** 실제 사용자 이름 */
 @Column({ name: 'username', type: 'varchar', length: 255, nullable: true })
  name: string;

  /** 생년월일 (YYYY-MM-DD) */
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  /** 로그인 ID(이메일) */
  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  /** 해싱된 비밀번호 */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /** 휴대폰 번호 */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  /** 비상 연락처 */
  @Column({ name: 'emergency_contact', type: 'varchar', length: 100, nullable: true })
  emergencyContact: string;

  /** 마지막으로 보고된 GPS 위도 */
  @Column({ name: 'last_gps_lat', type: 'double', nullable: true })
  lastGpsLat: number;

  /** 마지막으로 보고된 GPS 경도 */
  @Column({ name: 'last_gps_lng', type: 'double', nullable: true })
  lastGpsLng: number;

  /** 사용자의 안전 여부 */
  @Column({ name: 'is_safe', type: 'boolean', default: false })
  isSafe: boolean;

  /** 현재 사용자 층 (빌딩 내부) */
  @Column({ name: 'current_floor', type: 'int', nullable: true })
  currentFloor: number;

  /** 현재 사용자가 있는 빌딩 ID */
  @Column({ name: 'current_building_id', type: 'int', nullable: true })
  currentBuildingId: number;

  /** 레코드 생성 시각 */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  /** 레코드 수정 시각 */
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  /** FCM 토큰 (optional) */
  @Column({ name: 'fcm_token', type: 'varchar', length: 255, nullable: true })
  fcmToken: string | null;

  /** 관계: 현재 속한 빌딩 */
  @ManyToOne(() => Building)
  @JoinColumn({ name: 'current_building_id' })
  currentBuilding: Building;

  /** 관계: 위치 로그 기록 */
  @OneToMany(() => UserLocationLog, (log) => log.user)
  locationLogs: UserLocationLog[];
}
