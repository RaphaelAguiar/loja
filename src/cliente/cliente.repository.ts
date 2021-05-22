import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from './cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClienteRepository {
  constructor(
    @Inject('CLIENTE_REPOSITORY')
    private readonly repository: Repository<Cliente>,
  ) {}

  async findAll() {
    const all = await this.repository.find();
    return all;
  }
  async save(cliente: Cliente) {
    return await this.repository.save(cliente);
  }
  async findOne(codigo_cliente: number) {
    return await this.repository.findOne(codigo_cliente);
  }
  async delete(codigo_cliente: number) {
    return await this.repository.remove([{ codigo_cliente } as any]);
  }
}
