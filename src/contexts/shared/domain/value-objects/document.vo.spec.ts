import { describe, expect, it } from '@jest/globals';
import { DocumentVO } from './document.vo';

describe('DocumentVO', () => {
  it('parses and normalizes digits', () => {
    const d = DocumentVO.parse('529.982.247-25');
    expect(d.value).toBe('52998224725');
  });

  it('formats CPF when <= 11 digits', () => {
    const d = DocumentVO.parse('52998224725');
    expect(d.formatted).toBe('529.982.247-25');
  });

  it('tryParse returns null on invalid document', () => {
    expect(DocumentVO.tryParse('123')).toBeNull();
  });

  it('equals compares digits only', () => {
    const a = DocumentVO.parse('529.982.247-25');
    const b = DocumentVO.parse('52998224725');
    expect(a.equals(b)).toBe(true);
  });
});
