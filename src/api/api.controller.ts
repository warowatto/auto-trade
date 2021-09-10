import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Strategy } from 'src/database/entities/strategy.entity';
import { Trade } from 'src/database/entities/trade.entity';
import { UpbitService } from 'src/utils/upbit/upbit.service';
import { Connection } from 'typeorm';
import { APIService } from './api.service';
import { CreateStrategyDTO, UpdateStrategyDTO } from './dto/api.dto';

@Controller()
export class APIController {
  constructor(
    private readonly connection: Connection,
    private readonly apiService: APIService,
    private readonly upbitService: UpbitService,
  ) {}

  @Get('wallet')
  wallet() {
    return this.upbitService.wallet();
  }

  /**
   * 거래내역 조회
   *
   * @param offset
   * @param limit
   * @returns
   */
  @Get('trades')
  async trades(
    @Query('offset', new ParseIntPipe()) offset: number,
    @Query('limit', new ParseIntPipe()) limit: number,
  ) {
    const [count, rows] = await this.connection
      .getRepository(Trade)
      .findAndCount({
        skip: offset,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      config: {
        total: count,
        offset,
        limit,
      },
      data: rows,
    };
  }

  @Post('trade/:id/sell')
  async nowSell(@Param('id', new ParseIntPipe()) id: number) {}

  @Delete('trade/:id')
  async removeTrade(@Param('id', new ParseIntPipe()) id: number) {}

  @Get('strategy')
  async strategys() {
    return this.connection.getRepository(Strategy).find({
      order: {
        createdAt: 'ASC',
      },
    });
  }

  @Post('strategy')
  async createStrategy(@Body() data: CreateStrategyDTO) {}

  @Put('strategy/:id')
  async updateStrategy(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateStrategyDTO,
  ) {}

  @Delete('strategy/:id')
  async removeStrategy(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateStrategyDTO,
  ) {}
}
