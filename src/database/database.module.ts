import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Account } from './entities/account.entity';
import { Strategy } from './entities/strategy.entity';
import { Trade } from './entities/trade.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(process.cwd(), 'database', 'database.sqlite'),
      entities: [Account, Strategy, Trade],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
