import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JIGSAW_SECRET_KEY } from 'src/_jigsaw/envDefaults';
import { AuthController } from './auth.controller';
import { GoogleAuthModule } from 'src/google-auth/google-auth.module';
import { UserSignupLink } from './entities/signup-links.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSignupLink]),
    UsersModule,
    PassportModule,
    GoogleAuthModule,
    JwtModule.register({
      secret: JIGSAW_SECRET_KEY,
      signOptions: { expiresIn: '2d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
