// disaster-text-alert.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('disaster_text_alerts')
export class DisasterTextAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'msg_id', unique: true })
  msgId: string; // 중복 방지용 고유 메시지 ID

  @Column()
  sender: string; // 발신자

  @Column('text')
  content: string; // 메시지 내용

  @Column({ name: 'location_name', type: 'text', nullable: true })
locationName: string;


  @Column({ name: 'received_at', type: 'datetime' })
  receivedAt: Date; // 수신 시각

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
