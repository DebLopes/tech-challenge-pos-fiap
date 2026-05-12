import { describe, expect, it } from '@jest/globals';
import { Money } from './money.vo';

describe('Money', () => {
  it('rejects negative or non-finite amounts', () => {
    expect(() => Money.parse(-1)).toThrow('Invalid monetary amount');
    expect(() => Money.parse(Number.NaN)).toThrow('Invalid monetary amount');
  });

  it('converts cents to amount and back', () => {
    const m = Money.fromCents(1234);
    expect(m.value).toBe(12.34);
    expect(m.cents).toBe(1234);
  });

  it('rounds cents properly', () => {
    const m = Money.parse(10.005);
    expect(m.cents).toBe(1001);
  });
});
