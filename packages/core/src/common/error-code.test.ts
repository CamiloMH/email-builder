import { describe, expect, it } from 'vitest';
import { ApiErrorCode, defaultErrorCodeForStatus } from './error-code';

describe('defaultErrorCodeForStatus', () => {
  it('maps known statuses to codes', () => {
    expect(defaultErrorCodeForStatus(400)).toBe(ApiErrorCode.ValidationFailed);
    expect(defaultErrorCodeForStatus(404)).toBe(ApiErrorCode.NotFound);
    expect(defaultErrorCodeForStatus(429)).toBe(ApiErrorCode.RateLimited);
  });

  it('falls back to Unknown for other statuses', () => {
    expect(defaultErrorCodeForStatus(500)).toBe(ApiErrorCode.Unknown);
    expect(defaultErrorCodeForStatus(418)).toBe(ApiErrorCode.Unknown);
  });
});
