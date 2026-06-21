import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * Enum-like `const` of health statuses.
 */
export const HealthStatus = {
  Ok: 'ok',
} as const;

/**
 * The shape of a health-check response.
 */
export interface HealthResponse {
  /** The service status. */
  status: (typeof HealthStatus)[keyof typeof HealthStatus];
}

/**
 * Liveness endpoint, excluded from rate limiting.
 */
@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  /**
   * Reports service liveness.
   *
   * @returns The health status.
   */
  @Get()
  check(): HealthResponse {
    return { status: HealthStatus.Ok };
  }
}
