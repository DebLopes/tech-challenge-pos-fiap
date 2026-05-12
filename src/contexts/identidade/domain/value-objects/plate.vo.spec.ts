import { describe, expect, it } from '@jest/globals';
import { PlateVO } from './plate.vo';

describe('PlateVO', () => {
  it('parses and normalizes plate with hyphen', () => {
    const p = PlateVO.parse('apl-1234');
    expect(p.value).toBe('APL1234');
  });

  it('accepts Mercosul format', () => {
    const p = PlateVO.parse('ABC1D23');
    expect(p.value).toBe('ABC1D23');
  });

  it('rejects invalid plate', () => {
    expect(() => PlateVO.parse('12ABCD3')).toThrow('Invalid vehicle plate');
  });
});
