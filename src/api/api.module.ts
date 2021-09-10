import { Module } from '@nestjs/common';
import { BackgroundModule } from 'src/background/background.module';
import { SocketService } from 'src/utils/socket/socket.service';
import { UpbitModule } from 'src/utils/upbit/upbit.module';
import { APIController } from './api.controller';
import { APIService } from './api.service';

@Module({
  imports: [UpbitModule, BackgroundModule, SocketService],
  providers: [APIService],
  controllers: [APIController],
})
export class APIModule {}
