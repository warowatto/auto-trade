import { HttpModule, Module } from '@nestjs/common';
import { UpbitService } from './upbit.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.upbit.com/v1',
    }),
  ],
  providers: [UpbitService],
  exports: [UpbitService],
})
export class UpbitModule {}
