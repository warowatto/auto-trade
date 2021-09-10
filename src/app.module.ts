import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './api/api.module';
import { BackgroundModule } from './background/background.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    BackgroundModule,
    APIModule,
  ],
})
export class AppModule {}
