import { Module } from '@nestjs/common';
import { MuxController } from './mux.controller';
import { MuxService } from './mux.service';
import { MuxClient } from './mux-client';
import { Logger } from '@nestjs/common';
import { AiModule } from 'src/ai/ai.module';
@Module({
  imports: [AiModule],
  controllers: [MuxController],
  providers: [MuxService, MuxClient, Logger],
  exports: [MuxService],
})
export class MuxModule {}
