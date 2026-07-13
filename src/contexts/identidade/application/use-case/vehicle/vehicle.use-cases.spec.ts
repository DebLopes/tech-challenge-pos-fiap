import { describe, expect, it } from '@jest/globals';
import { Vehicle } from '../../../domain/entities/vehicle';
import { VehicleRepositoryInterface } from '../../../domain/repositories/vehicle.repository';
import { PlateVO } from '../../../../shared/domain/value-objects/plate.vo';
import { CreateVehicleUseCase } from './create-vehicle';
import { DeleteVehicleUseCase } from './delete-vehicle';
import { GetAllVehiclesUseCase } from './get-all-vehicles';
import { GetVehicleUseCase } from './get-vehicle';
import { UpdatedVehicleUseCase } from './update-vehicle';

function plateKey(plate: string): string {
  return PlateVO.parse(plate).value;
}

class InMemoryVehicleRepository implements VehicleRepositoryInterface {
  public vehicles = new Map<string, Vehicle>();

  create(data: Vehicle): Promise<Vehicle> {
    this.vehicles.set(data.plate, data);
    return Promise.resolve(data);
  }

  find(): Promise<Vehicle[]> {
    return Promise.resolve([...this.vehicles.values()].reverse());
  }

  findById(id: string): Promise<Vehicle | null> {
    return Promise.resolve(
      [...this.vehicles.values()].find((v) => v.id === id) ?? null,
    );
  }

  findByPlate(plate: string): Promise<Vehicle> {
    const v = this.vehicles.get(plateKey(plate));
    if (!v) throw new Error('not found');
    return Promise.resolve(v);
  }

  updateByPlate(
    plate: string,
    dataUpdate: Partial<{ model: string; brand: string; year: number }>,
  ): Promise<Vehicle> {
    const key = plateKey(plate);
    const current = this.vehicles.get(key);
    if (!current) throw new Error('not found');
    const updated = Vehicle.create(
      {
        plate: current.plate,
        model: dataUpdate.model ?? current.model,
        brand: dataUpdate.brand ?? current.brand,
        year: dataUpdate.year ?? current.year,
      },
      current.id,
    );
    this.vehicles.set(key, updated);
    return Promise.resolve(updated);
  }

  remove(plate: string): Promise<void> {
    this.vehicles.delete(plateKey(plate));
    return Promise.resolve();
  }
}

describe('Vehicle use cases', () => {
  it('creates a vehicle', async () => {
    const repository = new InMemoryVehicleRepository();
    const useCase = new CreateVehicleUseCase(repository);

    const response = await useCase.execute({
      plate: 'ABC-1234',
      model: 'HR-V',
      brand: 'Honda',
      year: 2024,
    });

    expect(response.id).toBeDefined();
    expect(response.plate).toBe('ABC1234');
    expect(response.model).toBe('HR-V');
    expect(repository.vehicles.size).toBe(1);
  });

  it('gets a vehicle by plate', async () => {
    const repository = new InMemoryVehicleRepository();
    await repository.create(
      Vehicle.create({
        plate: 'ABC-1234',
        model: 'HR-V',
        brand: 'Honda',
        year: 2024,
      }),
    );
    const useCase = new GetVehicleUseCase(repository);

    const response = await useCase.execute('ABC-1234');

    expect(response.plate).toBe('ABC1234');
    expect(response.brand).toBe('Honda');
  });

  it('lists all vehicles', async () => {
    const repository = new InMemoryVehicleRepository();
    await repository.create(
      Vehicle.create({
        plate: 'XYZ-9000',
        model: 'Corolla',
        brand: 'Toyota',
        year: 2023,
      }),
    );
    await repository.create(
      Vehicle.create({
        plate: 'ABC-1234',
        model: 'HR-V',
        brand: 'Honda',
        year: 2024,
      }),
    );
    const useCase = new GetAllVehiclesUseCase(repository);

    const rows = await useCase.execute();

    expect(rows).toHaveLength(2);
    expect(rows.map((v) => v.plate)).toEqual(['ABC1234', 'XYZ9000']);
  });

  it('updates a vehicle', async () => {
    const repository = new InMemoryVehicleRepository();
    await repository.create(
      Vehicle.create({
        plate: 'ABC-1234',
        model: 'HR-V',
        brand: 'Honda',
        year: 2024,
      }),
    );
    const useCase = new UpdatedVehicleUseCase(repository);

    const response = await useCase.execute('ABC-1234', {
      model: 'Civic',
    });

    expect(response.model).toBe('Civic');
  });

  it('deletes a vehicle', async () => {
    const repository = new InMemoryVehicleRepository();
    await repository.create(
      Vehicle.create({
        plate: 'ABC-1234',
        model: 'HR-V',
        brand: 'Honda',
        year: 2024,
      }),
    );
    const useCase = new DeleteVehicleUseCase(repository);

    await useCase.execute('ABC-1234');

    expect(repository.vehicles.has('ABC1234')).toBe(false);
  });
});
