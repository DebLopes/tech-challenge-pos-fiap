import { randomUUID } from 'crypto';

export type CatalogServiceDefaultPart = {
  productCode: string;
  quantity: number;
};

export type CatalogServiceProps = {
  name: string;
  description?: string;
  basePrice: number;
  active: boolean;
  defaultParts: CatalogServiceDefaultPart[];
};

export class CatalogService {
  public readonly id: string;
  private props: CatalogServiceProps;

  private constructor(props: CatalogServiceProps, id?: string) {
    CatalogService.assertValid(props);
    this.id = id || randomUUID();
    this.props = CatalogService.normalizeProps(props);
  }

  static create(props: CatalogServiceProps, id?: string): CatalogService {
    return new CatalogService(props, id);
  }

  private static normalizeProps(
    props: CatalogServiceProps,
  ): CatalogServiceProps {
    return {
      name: props.name.trim(),
      description: props.description?.trim() || undefined,
      basePrice: props.basePrice,
      active: props.active,
      defaultParts: props.defaultParts.map((p) => ({
        productCode: p.productCode.trim().toUpperCase(),
        quantity: p.quantity,
      })),
    };
  }

  static assertValid(props: CatalogServiceProps): void {
    const name = props.name?.trim();
    if (!name) {
      throw new Error('Catalog service name is required');
    }
    if (props.basePrice < 0 || Number.isNaN(props.basePrice)) {
      throw new Error('Catalog service basePrice must be a number >= 0');
    }
    const codes = new Set<string>();
    for (const part of props.defaultParts) {
      const code = part.productCode?.trim().toUpperCase();
      if (!code) {
        throw new Error('Each default part must have a productCode');
      }
      if (part.quantity <= 0 || !Number.isFinite(part.quantity)) {
        throw new Error(
          `Quantity for product "${code}" must be a positive number`,
        );
      }
      if (codes.has(code)) {
        throw new Error(`Duplicate productCode "${code}" in default parts`);
      }
      codes.add(code);
    }
  }

  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get basePrice() {
    return this.props.basePrice;
  }
  get active() {
    return this.props.active;
  }
  get defaultParts(): CatalogServiceDefaultPart[] {
    return [...this.props.defaultParts];
  }

  update(partial: Partial<CatalogServiceProps>): void {
    const next: CatalogServiceProps = {
      name: partial.name ?? this.props.name,
      description:
        partial.description !== undefined
          ? partial.description
          : this.props.description,
      basePrice: partial.basePrice ?? this.props.basePrice,
      active: partial.active ?? this.props.active,
      defaultParts: partial.defaultParts ?? this.props.defaultParts,
    };
    CatalogService.assertValid(next);
    this.props = CatalogService.normalizeProps(next);
  }

  setActive(active: boolean): void {
    this.update({ active });
  }

  toJSON() {
    return {
      id: this.id,
      ...this.props,
      defaultParts: this.defaultParts,
    };
  }
}
