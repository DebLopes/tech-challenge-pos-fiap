export type AverageExecutionBreakdownItem = {
  serviceOrderId: string;
  executionMinutes: number;
  startedAt: Date;
  finishedAt: Date;
  vehiclePlate: string;
};

export type AverageExecutionTimeResult = {
  averageMinutes: number;
  sampleSize: number;
  items: AverageExecutionBreakdownItem[];
};
