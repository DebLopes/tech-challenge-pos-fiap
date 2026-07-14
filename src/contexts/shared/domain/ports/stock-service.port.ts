export type StockDemandItem = {
  productCode: string;
  required: number;
};

export type StockAvailabilityItem = {
  productCode: string;
  required: number;
  available: number;
};

export type StockQuoteItem = {
  productCode: string;
  required: number;
  totalCost: number;
  unitPrice: number;
};

export interface StockServicePort {
  getAvailability(demand: StockDemandItem[]): Promise<StockAvailabilityItem[]>;
  quoteFifoCost(demand: StockDemandItem[]): Promise<StockQuoteItem[]>;
  decreaseStock(productCode: string, quantity: number): Promise<void>;
}

export const STOCK_SERVICE = Symbol('STOCK_SERVICE');
