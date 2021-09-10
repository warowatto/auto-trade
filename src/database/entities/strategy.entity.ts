import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trade } from './trade.entity';

@Entity()
export class Strategy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20, comment: '종목' })
  market: string;

  @Column('decimal', { comment: '최소 주문단위' })
  minAmount: number;

  @Column('int', { default: 3, comment: '2평선 평균 일수' })
  beforeAverageDay: number;

  @Column('decimal', { comment: '변동 상수' })
  basicRate: number;

  @Column('decimal', { comment: '' })
  higherRate: number;

  @Column('decimal', { comment: '한화 배팅금액' })
  bettingAmount: number;

  @Column('datetime', { nullable: true, comment: '전략 중지일시' })
  stopAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
