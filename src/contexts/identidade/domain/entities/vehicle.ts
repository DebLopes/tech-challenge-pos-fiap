import { randomUUID } from 'crypto';
import { PlateVO } from '../value-objects/plate.vo';

export type VehicleProps = {
  plate: PlateVO;
  model: string;
  brand: string;
  year: number;
};

export class Vehicle {
  public readonly id: string;
  private props: VehicleProps;

  private constructor(props: VehicleProps, id?: string) {
    this.id = id || randomUUID();
    this.props = props;
  }

  static create(
    input: { plate: string; model: string; brand: string; year: number },
    id?: string,
  ): Vehicle {
    return new Vehicle(
      {
        plate: PlateVO.parse(input.plate),
        model: input.model,
        brand: input.brand,
        year: input.year,
      },
      id,
    );
  }

  get plate() {
    return this.props.plate.value;
  }

  get model() {
    return this.props.model;
  }

  get brand() {
    return this.props.brand;
  }

  get year() {
    return this.props.year;
  }

  toJSON() {
    return {
      id: this.id,
      plate: this.props.plate.value,
      model: this.props.model,
      brand: this.props.brand,
      year: this.props.year,
    };
  }
}
