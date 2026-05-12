export class Money {
  private constructor(public readonly amount: number) {}

  static create(amount: number): Money {
    return Money.parse(amount);
  }

  static parse(amount: number): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Invalid monetary amount');
    }
    return new Money(amount);
  }

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new Error('Invalid monetary amount (cents)');
    }
    return new Money(cents / 100);
  }

  get value(): number {
    return this.amount;
  }

  get cents(): number {
    return Math.round(this.amount * 100);
  }
}
