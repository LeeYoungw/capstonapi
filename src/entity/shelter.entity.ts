import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shelters')
export class Shelter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string; // REARE_NM

  @Column({ name: 'address' })
  address: string; // RONA_DADDR

  @Column('double', { name: 'lat' })
  lat: number; // LAT

  @Column('double', { name: 'lng' })
  lng: number; // LOT

  @Column({ name: 'shelter_type_code' })
  shelterTypeCode: number; // SHLT_SE_CD

  @Column({ name: 'shelter_type_name' })
  shelterTypeName: string; // SHLT_SE_NM

  @Column({ name: 'mng_sn', nullable: true })
  mngSn: string; // MNG_SN (선택)
}

