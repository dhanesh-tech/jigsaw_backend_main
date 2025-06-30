import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ping')
  healthCheck(): Promise<any> {
    return this.appService.healthStatus();
  }

  @Get('/sentry-error-log')
  sentryErrorCheck(): Promise<any> {
    throw new Error('Error here for sentry');
  }
}
