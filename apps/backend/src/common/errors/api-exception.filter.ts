import { ApiErrorCode, defaultErrorCodeForStatus, type ApiErrorBody } from '@email/core';
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Global exception filter that normalizes every error into a stable
 * {@link ApiErrorBody} (`{ statusCode, code, message }`). The `code` lets the
 * frontend render a localized message; `message` carries human-readable detail.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  /**
   * @inheritdoc
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = ApiExceptionFilter.normalize(exception);
    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${body.code}: ${body.message}`);
    }
    response.status(body.statusCode).json(body);
  }

  // Translates any thrown value into a normalized error body.
  private static normalize(exception: unknown): ApiErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        const code = (obj.code as ApiErrorCode) ?? defaultErrorCodeForStatus(statusCode);
        const rawMessage = obj.message ?? exception.message;
        const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
        return { statusCode, code, message };
      }
      return { statusCode, code: defaultErrorCodeForStatus(statusCode), message: String(res) };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ApiErrorCode.Unknown,
      message: exception instanceof Error ? exception.message : 'Internal server error',
    };
  }
}
