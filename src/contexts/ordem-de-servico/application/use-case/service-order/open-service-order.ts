import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '../../../../identidade/domain/entities/client';
import { Vehicle } from '../../../../identidade/domain/entities/vehicle';
import type { ClientRepositoryInterface } from '../../../../identidade/domain/repositories/client.repository';
import type { VehicleRepositoryInterface } from '../../../../identidade/domain/repositories/vehicle.repository';
import {
  CLIENT_REPOSITORY,
  VEHICLE_REPOSITORY,
} from '../../../../identidade/domain/repositories/tokens';
import { CreateClientUseCase } from '../../../../identidade/application/use-case/client/create-client';
import { CreateVehicleUseCase } from '../../../../identidade/application/use-case/vehicle/create-vehicle';
import {
  ServiceOrder,
  type ServiceOrderPartLine,
  type ServiceOrderServiceLine,
} from '../../../domain/entities/service-order';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import {
  CATALOG_SERVICE_REPOSITORY,
  PRODUCT_REPOSITORY,
  SERVICE_ORDER_REPOSITORY,
} from '../../../domain/repositories/tokens';
import type { OpenServiceOrderInput } from './service-order.inputs';

@Injectable()
export class OpenServiceOrderUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepositoryInterface,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepo: VehicleRepositoryInterface,
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
    private readonly createClient: CreateClientUseCase,
    private readonly createVehicle: CreateVehicleUseCase,
  ) {}

  async execute(input: OpenServiceOrderInput): Promise<ServiceOrder> {
    const client = await this.getOrCreateClient(input.client);
    const vehicle = await this.getOrCreateVehicle(input.vehicle);
    const serviceLines = await this.resolveServiceLines(input.services ?? []);
    const partLines = await this.resolvePartLines(input.parts ?? []);

    const order = ServiceOrder.create({
      client: {
        id: client.id,
        document: client.document,
        name: client.name,
      },
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      },
      requestedServicesDescription: input.requestedServicesDescription,
      serviceLines,
      partLines,
    });

    return this.orderRepo.create(order);
  }

  private async resolveServiceLines(
    services: NonNullable<OpenServiceOrderInput['services']>,
  ): Promise<Omit<ServiceOrderServiceLine, 'id'>[]> {
    const lines: Omit<ServiceOrderServiceLine, 'id'>[] = [];

    for (const service of services) {
      const catalog = await this.catalogRepo.findById(service.catalogServiceId);
      if (!catalog) {
        throw new NotFoundException('Catalog service not found');
      }
      if (!catalog.active) {
        throw new BadRequestException(
          'Cannot add an inactive catalog service to an order',
        );
      }

      const defaultParts: ServiceOrderServiceLine['defaultParts'] = [];
      for (const p of catalog.defaultParts ?? []) {
        const product = await this.productRepo.findByCodeOrNull(p.productCode);
        defaultParts.push({
          productCode: p.productCode,
          name: product?.name ?? p.productCode,
          quantity: p.quantity,
        });
      }

      lines.push({
        catalogServiceId: catalog.id,
        name: catalog.name,
        unitPrice: catalog.basePrice,
        quantity: service.quantity ?? 1,
        defaultParts,
      });
    }

    return lines;
  }

  private async resolvePartLines(
    parts: NonNullable<OpenServiceOrderInput['parts']>,
  ): Promise<Omit<ServiceOrderPartLine, 'id'>[]> {
    const lines: Omit<ServiceOrderPartLine, 'id'>[] = [];

    for (const part of parts) {
      const code = part.productCode.trim().toUpperCase();
      const product = await this.productRepo.findByCodeOrNull(code);
      if (!product) {
        throw new NotFoundException(`Product "${code}" not found`);
      }

      lines.push({
        productCode: code,
        name: product.name,
        quantity: part.quantity,
      });
    }

    return lines;
  }

  private async getOrCreateClient(
    input: OpenServiceOrderInput['client'],
  ): Promise<Client> {
    try {
      return await this.clientRepo.findByDocument(input.document);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      return this.createClient.execute(input);
    }
  }

  private async getOrCreateVehicle(
    input: OpenServiceOrderInput['vehicle'],
  ): Promise<Vehicle> {
    try {
      return await this.vehicleRepo.findByPlate(input.plate);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      return this.createVehicle.execute(input);
    }
  }
}
