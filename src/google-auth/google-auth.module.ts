import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthClient } from './google-auth.client';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthToken } from './entities/google-auth-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/user.module';
@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([GoogleAuthToken])],
  providers: [GoogleAuthClient, GoogleAuthService],
  exports: [GoogleAuthService],
  controllers: [GoogleAuthController],
})
export class GoogleAuthModule {}
