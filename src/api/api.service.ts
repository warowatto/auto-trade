import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackgroundService } from 'src/background/background.service';
import { Account } from 'src/database/entities/account.entity';
import { Trade, TradeType } from 'src/database/entities/trade.entity';
import { SocketService } from 'src/utils/socket/socket.service';
import { UpbitService } from 'src/utils/upbit/upbit.service';
import { Connection } from 'typeorm';

@Injectable()
export class APIService implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly connection: Connection,
    private readonly backgroundService: BackgroundService,
    private readonly upbitService: UpbitService,
  ) {}

  async onModuleInit() {
    const account = await this.connection.getRepository(Account).findOne();
    const API_KEY = account?.key ?? this.config.get('UPBIT_API_KEY');
    const API_SECRET = account?.secret ?? this.config.get('UPBIT_API_SECRET');
    this.upbitService.setAPIKey(API_KEY, API_SECRET);

    const latestUnConfirmedTrades = await this.connection
      .getRepository(Trade)
      .find({
        where: { type: TradeType.BUY, buyAt: null },
      });
    
    this.backgroundService.initalSubscribeTrade(latestUnConfirmedTrades);
  }
}
