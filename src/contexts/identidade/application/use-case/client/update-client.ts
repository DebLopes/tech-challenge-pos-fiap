import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../../domain/entities/client';
import type { ClientRepositoryInterface } from '../../../domain/repositories/client.repository';
import { CLIENT_REPOSITORY } from '../../../domain/repositories/tokens';
import type { UpdateClientInput } from './client.inputs';

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepositoryInterface,
  ) {}

  async execute(document: string, input: UpdateClientInput): Promise<Client> {
    return this.clientRepo.updateByDocument(document, input);
  }
}
