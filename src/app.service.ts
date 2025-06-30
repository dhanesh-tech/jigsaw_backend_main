import { Injectable } from '@nestjs/common';
import { PORT } from './_jigsaw/envDefaults';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! ${PORT}`;
  }

  healthStatus(): any {
    return { ping: `Running pong` };
  }
}
