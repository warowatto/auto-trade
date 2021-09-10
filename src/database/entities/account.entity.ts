import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({})
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  secret: string;

  @Column()
  token: string;
}
