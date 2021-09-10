import { Module } from '@nestjs/common';
import { RuleModule } from 'src/utils/rule/rule.module';
import { SocketModule } from 'src/utils/socket/socket.module';
import { BackgroundService } from './background.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UpbitModule } from 'src/utils/upbit/upbit.module';

@Module({
  imports: [ScheduleModule.forRoot(), SocketModule, RuleModule, UpbitModule],
  providers: [BackgroundService],
  exports: [BackgroundService],
})
export class BackgroundModule {}
