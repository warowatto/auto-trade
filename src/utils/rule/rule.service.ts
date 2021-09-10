import { Injectable } from '@nestjs/common';
import { sumBy } from 'lodash';
import { Strategy } from 'src/database/entities/strategy.entity';
import { Trade, TradeType } from 'src/database/entities/trade.entity';
import { UpbitService } from '../upbit/upbit.service';

@Injectable()
export class RuleService {
  constructor(private readonly upbitService: UpbitService) {}

  async createRule(strategy: Strategy): Promise<Trade> {
    const market = strategy.market;
    const [now, ...other] = await this.upbitService.candle(
      market,
      strategy.beforeAverageDay + 1,
    );
    const [yesterday] = other;

    const hasRisk =
      now.opening_price <
      sumBy(other, (value) => value.opening_price) / other.length;
    const buyAmount =
      (yesterday.high_price - yesterday.low_price) *
        (hasRisk ? strategy.higherRate : strategy.basicRate) +
      now.opening_price;

    const trade = new Trade();
    trade.type = TradeType.BUY;
    trade.market = market;
    trade.targetAmount = buyAmount;
    trade.buyAmount = strategy.bettingAmount;

    return trade;
  }
}
