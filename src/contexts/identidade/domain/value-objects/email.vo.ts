const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class EmailVO {
  private constructor(public readonly normalized: string) {}

  static create(raw: string): EmailVO {
    return EmailVO.parse(raw);
  }

  static parse(raw: string): EmailVO {
    const trimmed = raw?.trim().toLowerCase();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      throw new Error('Invalid email');
    }
    return new EmailVO(trimmed);
  }

  static isValid(raw: string): boolean {
    const trimmed = raw?.trim().toLowerCase();
    return Boolean(trimmed && EMAIL_RE.test(trimmed));
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: EmailVO): boolean {
    return this.normalized === other.normalized;
  }
}
