import { describe, expect, it } from 'vitest';
import { Align, alignSchema, hexColorSchema } from './color.schema';

describe('hexColorSchema', () => {
  it.each(['#000000', '#FFFFFF', '#1a2b3c', '#1A2B3C'])('accepts %s', (value) => {
    expect(hexColorSchema.parse(value)).toBe(value);
  });

  it.each(['000000', '#fff', '#GGGGGG', '#12345', '#1234567', 'red', ''])('rejects %s', (value) => {
    expect(hexColorSchema.safeParse(value).success).toBe(false);
  });
});

describe('alignSchema', () => {
  it.each(Object.values(Align))('accepts %s', (value) => {
    expect(alignSchema.parse(value)).toBe(value);
  });

  it('rejects unknown alignment', () => {
    expect(alignSchema.safeParse('justify').success).toBe(false);
  });
});
