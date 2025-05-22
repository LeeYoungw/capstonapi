// disaster.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('disasters')
export class Disaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['earthquake', 'fire', 'flood', 'typhoon', 'etc'] })
  type: 'earthquake' | 'fire' | 'flood' | 'typhoon' | 'etc';

  @Column('text')
  description: string;

  @Column()
  severity: number;

  @Column({ name: 'occurred_at', type: 'datetime' })
  occurredAt: Date;

  @Column()
  source: string;

  @Column('double')
  lat: number;

  @Column('double')
  lng: number;
}