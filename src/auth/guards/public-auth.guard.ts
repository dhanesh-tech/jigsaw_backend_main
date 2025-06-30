import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// for routes which will be publically accessible -> returns user or null
@Injectable()
export class PublicAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user: any) {
    return user || null;
  }
}
