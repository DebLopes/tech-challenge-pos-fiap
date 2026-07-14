export interface DomainErrorOptions {
  code?: string;
  details?: Record<string, unknown>;
}

export abstract class DomainError extends Error {
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, options?: DomainErrorOptions) {
    super(message);
    this.name = new.target.name;
    if (options?.code) this.code = options.code;
    if (options?.details) this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
