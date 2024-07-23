import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    response.statusCode = exception.getStatus();

    const exceptionResponse = exception.getResponse() as { message: string[] };

    response
      .json({
        code: exception.getStatus(),
        message: 'fail',
        data: exceptionResponse?.message?.join
          ? exceptionResponse.message.join()
          : exception.message,
      })
      .end();
  }
}
