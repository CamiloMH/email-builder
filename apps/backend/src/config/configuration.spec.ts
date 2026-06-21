import { NodeEnv, validateEnv } from './configuration';

describe('validateEnv', () => {
  it('applies sensible defaults for an empty environment', () => {
    const env = validateEnv({});
    expect(env.PORT).toBe(3005);
    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.DB_SYNCHRONIZE).toBe(false);
  });

  it('coerces and parses provided values', () => {
    const env = validateEnv({ PORT: '4000', NODE_ENV: 'test', DB_SYNCHRONIZE: 'true' });
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe(NodeEnv.Test);
    expect(env.DB_SYNCHRONIZE).toBe(true);
  });

  it('treats any non-"true" sync value as false', () => {
    expect(validateEnv({ DB_SYNCHRONIZE: 'false' }).DB_SYNCHRONIZE).toBe(false);
  });

  it('throws on an invalid environment', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow();
    expect(() => validateEnv({ PORT: '-5' })).toThrow();
  });
});
