import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SOMETHING_WENT_WRONG } from 'src/_jigsaw/constants';
import * as Sentry from '@sentry/nestjs';

/**
 * method catches all exceptions of any kind
 * it returns the HttpException in case there is handled exception
 * to be thrown to user
 *
 * in case of unhandled exception returns
 * 
 * errors returned in this format: 
 * 
 * {
      statusCode: number, -> http status code
      timestamp: Date,
      path: string,
      msg: string,
    };
 */
@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  @Sentry.WithSentry()
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    console.log('exception', exception);

    // Check if the exception is an instance of HttpException
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Format the response
    const errorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      msg:
        exception instanceof HttpException
          ? exception.getResponse()
          : SOMETHING_WENT_WRONG,
    };

    // Send the error response
    response.status(statusCode).json(errorResponse);
  }
}
