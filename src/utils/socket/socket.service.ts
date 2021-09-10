import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromEvent, Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import * as WebSocket from 'ws';
import { Ticker } from './types/ticker.types';

@Injectable()
export class SocketService implements OnModuleInit {
  markets = new Set<string>().add('KRW-BTC').add('KRW-ETH');
  socket: WebSocket;

  constructor(
    private readonly config: ConfigService,
    private readonly connection: Connection,
  ) {}

  async onModuleInit() {
    this.socket = new WebSocket(this.config.get('SOCKET_HOST'));
    this.socket.on('open', this.onUpdate.bind(this));
  }

  private onUpdate() {
    const params = [
      { ticket: v4() },
      { type: 'ticker', codes: Array.from(this.markets.values()) },
    ];

    this.socket.send(JSON.stringify(params));
  }

  subscribe(market: string) {
    this.markets.add(market.toUpperCase());
    this.onUpdate();
  }

  unsubscribe(market: string) {
    this.markets.delete(market.toUpperCase());
    this.onUpdate();
  }

  get $ticker(): Observable<Ticker> {
    return fromEvent(this.socket, 'message').pipe(
      map(
        (data: WebSocket.MessageEvent) =>
          JSON.parse(data.data.toString()) as Ticker,
      ),
      share(),
    );
  }
}
