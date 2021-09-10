import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TradeType {
  BUY = 'bid',
  SELL = 'ask',
  CANCEL = 'cancel',
}

@Entity()
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 10 })
  type: TradeType;

  @Column({ type: 'varchar', length: 20, comment: '종목' })
  market: string;

  @Column('decimal', { comment: '단위 가격' })
  targetAmount: number;

  @Column('decimal', { nullable: true, comment: '구매 수량' })
  volume?: number;

  @Column('decimal', { nullable: true, comment: '구매 한화' })
  buyAmount?: number;

  @Column('decimal', { nullable: true, comment: '판매 한화' })
  sellAmount?: number;

  @Column('datetime', { nullable: true, comment: '구매 일시' })
  buyAt?: Date;

  @Column('datetime', { nullable: true, comment: '판매 일시' })
  sellAt?: Date;

  @CreateDateColumn({ type: 'datetime', comment: '등록일시' })
  createdAt: Date;
}
