import { cnpj, cpf } from 'cpf-cnpj-validator';

export class DocumentVO {
  private constructor(public readonly digits: string) {}

  static create(raw: string): DocumentVO {
    return DocumentVO.parse(raw);
  }

  static parse(raw: string): DocumentVO {
    const digits = raw.replace(/\D/g, '');
    if (!cpf.isValid(digits) && !cnpj.isValid(digits)) {
      throw new Error('Invalid document (CPF or CNPJ)');
    }
    return new DocumentVO(digits);
  }

  static tryParse(raw: string): DocumentVO | null {
    try {
      return DocumentVO.parse(raw);
    } catch {
      return null;
    }
  }

  static isValid(raw: string): boolean {
    const digits = typeof raw === 'string' ? raw.replace(/\D/g, '') : '';
    return cpf.isValid(digits) || cnpj.isValid(digits);
  }

  get value(): string {
    return this.digits;
  }

  get formatted(): string {
    return this.digits.length <= 11
      ? cpf.format(this.digits)
      : cnpj.format(this.digits);
  }

  equals(other: DocumentVO): boolean {
    return this.digits === other.digits;
  }
}
