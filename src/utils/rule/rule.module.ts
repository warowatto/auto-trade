import { Module } from '@nestjs/common';
import { UpbitModule } from '../upbit/upbit.module';
import { RuleService } from './rule.service';

@Module({
  imports: [UpbitModule],
  providers: [RuleService],
  exports: [RuleService],
})
export class RuleModule {}
