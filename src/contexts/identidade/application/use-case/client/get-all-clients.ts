import { Inject, Injectable } from '@nestjs/common';
import { Client } from '../../../domain/entities/client';
import type { ClientRepositoryInterface } from '../../../domain/repositories/client.repository';
import { CLIENT_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetAllClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepositoryInterface,
  ) {}

  async execute(): Promise<Client[]> {
    return this.clientRepo.find();
  }
}
