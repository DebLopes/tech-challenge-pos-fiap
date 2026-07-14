import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ConflictError,
  DomainError,
  EntityNotFoundError,
  UnauthorizedError,
} from '../../../domain/errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, error } = this.resolve(exception);
    const body: Record<string, unknown> = {
      statusCode: status,
      message: exception.message,
      error,
    };
    if (exception.code) body.code = exception.code;
    if (exception.details) Object.assign(body, exception.details);

    response.status(status).json(body);
  }

  private resolve(exception: DomainError): { status: number; error: string } {
    if (exception instanceof EntityNotFoundError) {
      return { status: HttpStatus.NOT_FOUND, error: 'Not Found' };
    }
    if (exception instanceof ConflictError) {
      return { status: HttpStatus.CONFLICT, error: 'Conflict' };
    }
    if (exception instanceof UnauthorizedError) {
      return { status: HttpStatus.UNAUTHORIZED, error: 'Unauthorized' };
    }
    return { status: HttpStatus.BAD_REQUEST, error: 'Bad Request' };
  }
}
