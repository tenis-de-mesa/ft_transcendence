import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Response } from 'express';

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  catch(error: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = error.response ? error.response.status : 500;
    const message = error.response
      ? error.response.data
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
