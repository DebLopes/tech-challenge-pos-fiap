import type {
  CreateServiceOrderInput,
  OpenServiceOrderInput,
} from '../../../../application/use-case/service-order/service-order.inputs';
import type { CreateServiceOrderRequestDto } from '../dtos/create-service-order-request.dto';
import type { OpenServiceOrderRequestDto } from '../dtos/open-service-order-request.dto';

export class ServiceOrderRequestMapper {
  static toCreateInput(
    dto: CreateServiceOrderRequestDto,
  ): CreateServiceOrderInput {
    return {
      clientId: dto.clientId,
      vehicleId: dto.vehicleId,
      requestedServicesDescription: dto.requestedServicesDescription,
    };
  }

  static toOpenInput(dto: OpenServiceOrderRequestDto): OpenServiceOrderInput {
    return {
      client: {
        name: dto.client.name,
        document: dto.client.document,
        email: dto.client.email,
      },
      vehicle: {
        plate: dto.vehicle.plate,
        model: dto.vehicle.model,
        brand: dto.vehicle.brand,
        year: dto.vehicle.year,
      },
      requestedServicesDescription: dto.requestedServicesDescription,
      services: dto.services?.map((s) => ({
        catalogServiceId: s.catalogServiceId,
        quantity: s.quantity,
      })),
      parts: dto.parts?.map((p) => ({
        productCode: p.productCode,
        quantity: p.quantity,
      })),
    };
  }
}
