import { ConflictError } from '../../../../shared/domain/errors';

export type StockShortageItem = {
  productCode: string;
  required: number;
  available: number;
};

export const STOCK_SHORTAGE_USER_MESSAGE =
  'Ordem com valores desatualizados. Entre em contato com a oficina.';

export const STOCK_SHORTAGE_CODE = 'INSUFFICIENT_STOCK';

export function conflictExceptionForStockShortage(
  items: StockShortageItem[],
): ConflictError {
  return new ConflictError(STOCK_SHORTAGE_USER_MESSAGE, {
    code: STOCK_SHORTAGE_CODE,
    details: { items },
  });
}
