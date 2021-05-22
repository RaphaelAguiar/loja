import { Inject, Injectable } from '@nestjs/common';
import { Produto } from './produto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProdutoRepository {
  constructor(
    @Inject('PRODUTO_REPOSITORY')
    private readonly repository: Repository<Produto>,
  ) {}

  async findAll() {
    const all = await this.repository.find();
    return all;
  }
  async save(produto: Produto) {
    return await this.repository.save(produto);
  }
  async findOne(codigo_produto: number) {
    return await this.repository.findOne(codigo_produto);
  }
  async delete(codigo_produto: number) {
    return await this.repository.remove([{ codigo_produto } as any]);
  }
}
