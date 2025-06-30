import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserMetaInfo } from './entities/user-meta-info.entity';
import { Company } from 'src/master/entities/company.entity';
import { MasterModule } from 'src/master/master.module';
import { AwsModule } from 'src/aws/aws.module';
import { AiAgentsModule } from 'src/ai-agents/ai-agents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserMetaInfo, Company]),
    MasterModule,
    AwsModule,
    AiAgentsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
