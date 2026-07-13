import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import {
  ServiceOrder,
  type ServiceOrderPartLine,
  type ServiceOrderServiceLine,
} from '../../../domain/entities/service-order';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import {
  CATALOG_SERVICE_REPOSITORY,
  SERVICE_ORDER_REPOSITORY,
} from '../../../domain/repositories/tokens';
import {
  CLIENT_PROVISIONING,
  type ClientProvisioningPort,
} from '../../../domain/services/client-provisioning.port';
import {
  VEHICLE_PROVISIONING,
  type VehicleProvisioningPort,
} from '../../../domain/services/vehicle-provisioning.port';
import {
  PRODUCT_LOOKUP,
  type ProductLookupPort,
} from '../../../domain/services/product-lookup.port';
import type { OpenServiceOrderInput } from './service-order.inputs';

@Injectable()
export class OpenServiceOrderUseCase {
  constructor(
    @Inject(CLIENT_PROVISIONING)
    private readonly clientProvisioning: ClientProvisioningPort,
    @Inject(VEHICLE_PROVISIONING)
    private readonly vehicleProvisioning: VehicleProvisioningPort,
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_LOOKUP)
    private readonly productLookup: ProductLookupPort,
  ) {}

  async execute(input: OpenServiceOrderInput): Promise<ServiceOrder> {
    const client = await this.clientProvisioning.getOrCreate(input.client);
    const vehicle = await this.vehicleProvisioning.getOrCreate(input.vehicle);
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
        throw new EntityNotFoundError('Catalog service not found');
      }
      if (!catalog.active) {
        throw new BusinessRuleViolationError(
          'Cannot add an inactive catalog service to an order',
        );
      }

      const defaultParts: ServiceOrderServiceLine['defaultParts'] = [];
      for (const p of catalog.defaultParts ?? []) {
        const product = await this.productLookup.findByCodeOrNull(
          p.productCode,
        );
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
      const product = await this.productLookup.findByCodeOrNull(code);
      if (!product) {
        throw new EntityNotFoundError(`Product "${code}" not found`);
      }

      lines.push({
        productCode: code,
        name: product.name,
        quantity: part.quantity,
      });
    }

    return lines;
  }
}
