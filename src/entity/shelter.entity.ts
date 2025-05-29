// shelter.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shelters')
export class Shelter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('double')
  lat: number;

  @Column('double')
  lng: number;

  @Column('text')
  address: string;

  @Column('json')
  available_for: number[]; // 대피소 구분 코드 배열
}