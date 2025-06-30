import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JIGSAW_SECRET_KEY } from 'src/_jigsaw/envDefaults';

import { Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtInterface } from './dto/jwt.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JIGSAW_SECRET_KEY,
    });
  }

  // validate user and returns it or return unauthorised exception
  async validate(payload: JwtInterface) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
