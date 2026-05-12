import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetProductBatchUseCase } from '../../../application/use-case/product-batch';
import { CreateProductBatchUseCase } from '../../../application/use-case/product-batch/create-product-batch';
import { UserRole } from '../../../../identidade/domain/entities/user-role';
import { AuthRoles } from '../../../../identidade/interfaces/http/auth/decorators/auth-roles.decorator';
import { CreateProductBatchDto } from './dtos/create-product-batch-request.dto';
import { ProductBatchResponseDto } from './dtos/product-batch-response.dto';

@ApiTags('Estoque / Lotes')
@ApiBearerAuth()
@Controller('product-batch')
export class ProductBatchController {
  constructor(
    private readonly createProductBatchUseCase: CreateProductBatchUseCase,
    private readonly getProductBatchUseCase: GetProductBatchUseCase,
  ) {}

  @Post()
  @AuthRoles(UserRole.ADMIN, UserRole.ESTOQUISTA)
  async create(
    @Body() dto: CreateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    const result = await this.createProductBatchUseCase.execute({
      productCode: dto.productCode,
      quantity: dto.quantity,
      costPrice: dto.costPrice,
      salePrice: dto.salePrice,
    });
    return ProductBatchResponseDto.toDtoFromCreate(result);
  }

  @Get(':codeProduct')
  @AuthRoles(UserRole.ADMIN, UserRole.ESTOQUISTA, UserRole.MECANICO)
  async findOne(
    @Param('codeProduct') codeProduct: string,
  ): Promise<ProductBatchResponseDto[]> {
    const rows = await this.getProductBatchUseCase.execute(codeProduct);
    return ProductBatchResponseDto.toDtoList(rows);
  }
}
