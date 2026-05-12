import { randomUUID } from 'crypto';

export type ProductBatchProps = {
  productCode: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
};

export class ProductBatch {
  public readonly id: string;
  private props: ProductBatchProps;

  private constructor(props: ProductBatchProps, id?: string) {
    this.id = id || randomUUID();
    this.props = props;
  }

  static create(props: ProductBatchProps, id?: string): ProductBatch {
    if (props.quantity <= 0)
      throw new Error('Quantity must be greater than zero');

    return new ProductBatch(props, id);
  }

  static restore(props: ProductBatchProps, id: string): ProductBatch {
    return new ProductBatch(props, id);
  }

  get costPrice() {
    return this.props.costPrice;
  }
  get salePrice() {
    return this.props.salePrice;
  }
  get productCode() {
    return this.props.productCode;
  }
  get quantity() {
    return this.props.quantity;
  }

  toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}

export function sumProductBatchQuantities(
  batches: readonly ProductBatch[],
): number {
  return batches.reduce<number>((sum, batch) => sum + batch.quantity, 0);
}
