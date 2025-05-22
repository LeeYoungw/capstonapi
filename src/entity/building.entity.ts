import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { User } from './user.entity'; 
//   import { WifiAccessPoint } from './wifi-access-point.entity';
//   import { MapNode } from './map-node.entity';
  
  @Entity('buildings')
  export class Building {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column('double')
    lat: number;
  
    @Column('double')
    lng: number;
  
    @Column({ type: 'json', nullable: true, name: 'stair_locations' })
    stairLocations: any;
  
    @Column({ name: 'floor_count' })
    floorCount: number;
  
    // Optional: 관계 (한 건물에 여러 유저가 위치할 수 있음)
    @OneToMany(() => User, (user) => user.currentBuilding)
    users: User[];
  
    // @OneToMany(() => WifiAccessPoint, (ap) => ap.building)
    // wifiAccessPoints: WifiAccessPoint[];
  
    // @OneToMany(() => MapNode, (node) => node.building)
    // mapNodes: MapNode[];
  }
  