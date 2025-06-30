import { Module } from '@nestjs/common';
import { HmsController } from './hms.controller';
import { HmsService } from './hms.service';
import { HmsClient } from './hms-client';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HmsRoomRecording } from './entities/hms-room-recording.entity';
import { AwsModule } from 'src/aws/aws.module';
import { MuxModule } from 'src/mux/mux.module';

@Module({
  controllers: [HmsController],
  providers: [HmsService, HmsClient],
  imports: [AwsModule, MuxModule, TypeOrmModule.forFeature([HmsRoomRecording])],
  exports: [HmsService],
})
export class HmsModule {}
