import { Injectable, Logger } from '@nestjs/common';
import type {
  BudgetDeliveryNotifier,
  BudgetDeliveryPayload,
} from '../../domain/ports/budget-delivery-notifier.port';

export const BUDGET_EMAIL_MESSAGE =
  'Use o serviceOrderId para consultar ou aprovar seu orçamento.';

export type BudgetEmailSimulation = {
  to: string;
  subject: string;
  message: string;
  serviceOrderId: string;
  currency: 'BRL';
  client: { name: string; document: string };
  vehicle: { plate: string; brand: string; model: string; year: number };
  budget: BudgetDeliveryPayload['budget'];
};

function buildSubject(p: BudgetDeliveryPayload): string {
  return `Orçamento da ordem de serviço ${p.serviceOrderId} — ${p.vehiclePlate}`;
}

/**
 * Simula envio do orçamento (sem SMTP). Emite um único JSON no log com destinatário,
 * assunto, identificação da OS, dados de cliente/veículo e o orçamento.
 */
@Injectable()
export class LoggingBudgetDeliveryNotifier implements BudgetDeliveryNotifier {
  private readonly logger = new Logger(LoggingBudgetDeliveryNotifier.name);

  notifyBudgetReady(payload: BudgetDeliveryPayload): Promise<void> {
    const mail: BudgetEmailSimulation = {
      to: payload.clientEmail,
      subject: buildSubject(payload),
      message: BUDGET_EMAIL_MESSAGE,
      serviceOrderId: payload.serviceOrderId,
      currency: 'BRL',
      client: {
        name: payload.clientName,
        document: payload.clientDocument,
      },
      vehicle: {
        plate: payload.vehiclePlate,
        brand: payload.vehicleBrand,
        model: payload.vehicleModel,
        year: payload.vehicleYear,
      },
      budget: payload.budget,
    };
    this.logger.log(`[orçamento enviado]\n${JSON.stringify(mail, null, 2)}`);
    return Promise.resolve();
  }
}
