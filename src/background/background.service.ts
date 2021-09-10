import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Trade, TradeType } from 'src/database/entities/trade.entity';
import { SocketService } from 'src/utils/socket/socket.service';
import {
  filter,
  take,
  repeat,
  tap,
  map,
  delay,
  switchMap,
  distinctUntilChanged,
} from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { RuleService } from 'src/utils/rule/rule.service';
import { Connection, EventSubscriber } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Strategy } from 'src/database/entities/strategy.entity';
import { UpbitService } from 'src/utils/upbit/upbit.service';
import { Exchange } from 'src/utils/upbit/types/exchange.types';

@EventSubscriber()
@Injectable()
export class BackgroundService implements OnModuleInit, OnModuleDestroy {
  private buyTrade = new Map<string, Trade>();
  private subscriber: Subscription;

  constructor(
    private readonly connection: Connection,
    private readonly socket: SocketService,
    private readonly ruleService: RuleService,
    private readonly upbitSerivce: UpbitService,
  ) {}

  async onModuleInit() {
    this.subscriber = this.socket.$ticker
      .pipe(
        filter((ticker) => this.buyTrade.has(ticker.code)),
        filter((ticker) => {
          const rule = this.buyTrade.get(ticker.code);
          return rule.targetAmount >= ticker.trade_price;
        }),
        map((ticker) => this.buyTrade.get(ticker.code)),
        distinctUntilChanged(),
        switchMap(this.buy.bind(this)),
        repeat(),
      )
      .subscribe(this.afterBuy.bind(this));
  }

  onModuleDestroy() {
    this.subscriber.unsubscribe();
  }

  @Cron('0 5 9 * * *')
  private async newDayStrategy() {
    const strategies = await this.connection.getRepository(Strategy).find({
      where: {
        stopAt: null,
      },
    });
    
    strategies.map((value) => value.market).forEach(this.socket.subscribe);
    
    let newTrades = await Promise.all(
      strategies.map(this.ruleService.createRule),
    );
    
    newTrades = await this.connection.manager.save(newTrades);
    if (newTrades.length === 0) return;
    
    newTrades.forEach((value) => {
      this.buyTrade.set(value.market, value);
    });

    this.afterCreateRule(newTrades);
  }

  @Cron('0 0 9 * * *')
  private async sell() {
    let wallet = await this.upbitSerivce.wallet();
    wallet = wallet.filter((value) => value.currency.toUpperCase() !== 'KRW');
    const exchanges = await Promise.all(
      wallet.map((value) => {
        const market = ['KRW', value.currency.toUpperCase()].join('-');
        return this.upbitSerivce.exchange(
          TradeType.SELL,
          market,
          parseFloat(value.balance),
        );
      }),
    );

    await this.connection
      .getRepository(Trade)
      .update({ type: TradeType.BUY, buyAt: null }, { type: TradeType.CANCEL });
    this.buyTrade.clear();
    this.afterSell(exchanges);
  }

  initalSubscribeTrade(trades: Trade[]) {
    trades.forEach((value) => this.buyTrade.set(value.market, value));
  }

  async updateSubscribeRule(market: string, isNowNewStrategy: boolean = false) {
    this.buyTrade.delete(market);
    await this.connection
      .getRepository(Trade)
      .update(
        { market, type: TradeType.BUY, buyAt: null },
        { type: TradeType.CANCEL },
      );

    if (isNowNewStrategy) {
      const strategy = await this.connection.getRepository(Strategy).findOne({
        where: { market, stopAt: null },
      });
      if (!strategy) return;

      let trade = await this.ruleService.createRule(strategy);
      trade = await this.connection.manager.save(trade);
      this.buyTrade.set(market, trade);
      this.afterCreateRule(trade);
    }
  }

  private async buy(trade: Trade) {
    const exchange = await this.upbitSerivce.exchange(
      TradeType.BUY,
      trade.market,
      trade.buyAmount,
    );

    trade.volume = parseFloat(exchange.volume);
    trade.buyAt = new Date();

    await this.connection.manager.save(trade);
    this.buyTrade.delete(trade.market);

    return exchange;
  }

  private async afterCreateRule(data: Trade | Trade[]) {
    if (Array.isArray(data)) {
    } else {
    }
    console.log('구매 조건 등록', data);
  }

  private async afterBuy(exchange: Exchange) {
    console.log('구매완료', exchange);
  }

  private async afterSell(datas: Exchange[]) {
    console.log('판매완료', datas);
  }
}
