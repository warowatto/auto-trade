import { HttpService, Injectable, OnModuleInit, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { sign } from 'jsonwebtoken';
import { lastValueFrom } from 'rxjs';
import { TradeType } from 'src/database/entities/trade.entity';
import { Candle, Exchange } from './types/exchange.types';
import * as crypto from 'crypto';
import { encode } from 'querystring';
import { pickBy, identity, isEmpty } from 'lodash';
import { v4 } from 'uuid';
import { Wallet } from './types/wallet.types';

@Injectable()
export class UpbitService {
  private api_key: string = '';
  private secret_key: string = '';

  constructor(private readonly httpService: HttpService) {}

  setAPIKey(key: string, secret: string) {
    this.api_key = key;
    this.secret_key = secret;
  }

  private request<T>(config: AxiosRequestConfig): Promise<T> {
    const params = pickBy(
      Object.assign({}, config?.data, config?.params),
      identity,
    );
    let payload: {
      access_key: string;
      nonce: string;
      query_hash?: string;
      query_hash_alg?: string;
    } = {
      access_key: this.api_key,
      nonce: v4(),
    };

    if (!isEmpty(params)) {
      payload.query_hash = crypto
        .createHash('sha512')
        .update(encode(params), 'utf-8')
        .digest('hex');
      payload.query_hash_alg = 'SHA512';
    }
    const token = sign(payload, this.secret_key);

    return lastValueFrom(
      this.httpService.request({
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ).then((res) => res.data);
  }

  async wallet() {
    return this.request<Wallet[]>({
      method: 'GET',
      url: '/accounts',
    });
  }

  async exchange(
    type: TradeType,
    market: string,
    amount: number,
  ): Promise<Exchange> {
    const parmas = pickBy(
      {
        market,
        side: type,
        volume: type === TradeType.SELL ? amount : undefined,
        price: type === TradeType.BUY ? amount : undefined,
        ord_type: type === TradeType.BUY ? 'price' : 'market',
      },
      identity,
    );

    return this.request<Exchange>({
      method: 'POST',
      url: '/v1/orders',
      data: parmas,
    });
  }

  async candle(market: string, offset: number) {
    return lastValueFrom(
      this.httpService.request<Candle[]>({
        method: 'GET',
        url: '/v1/days',
        params: {
          market,
          count: offset,
        },
      }),
    ).then((res) => res.data);
  }
}
