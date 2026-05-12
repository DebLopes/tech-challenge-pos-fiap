import { randomUUID } from 'crypto';

export type ProductProps = {
  code: string;
  name: string;
  description?: string;
};

export class Product {
  public readonly id: string;
  private props: ProductProps;

  private constructor(props: ProductProps, id?: string) {
    this.id = id || randomUUID();
    this.props = props;
  }

  static create(props: ProductProps, id?: string): Product {
    return new Product(props, id);
  }

  get code() {
    return this.props.code;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }

  toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
