const PLATE_RE = /^([A-Z]{3}\d[A-Z]\d{2}|[A-Z]{3}\d{4})$/;

export class PlateVO {
  private constructor(public readonly compact: string) {}

  static create(raw: string): PlateVO {
    return PlateVO.parse(raw);
  }

  static parse(raw: string): PlateVO {
    const s = raw.replace(/-/g, '').toUpperCase().trim();
    if (!PLATE_RE.test(s)) {
      throw new Error('Invalid vehicle plate');
    }
    return new PlateVO(s);
  }

  static isValid(raw: string): boolean {
    const s =
      typeof raw === 'string' ? raw.replace(/-/g, '').toUpperCase().trim() : '';
    return PLATE_RE.test(s);
  }

  get value(): string {
    return this.compact;
  }

  equals(other: PlateVO): boolean {
    return this.compact === other.compact;
  }
}
