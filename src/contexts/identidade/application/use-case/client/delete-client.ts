import { Inject, Injectable } from '@nestjs/common';
import type { ClientRepositoryInterface } from '../../../domain/repositories/client.repository';
import { CLIENT_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class DeleteClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepositoryInterface,
  ) {}

  async execute(document: string): Promise<void> {
    await this.clientRepo.remove(document);
  }
}
