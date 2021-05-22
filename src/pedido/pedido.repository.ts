import { Inject, Injectable } from '@nestjs/common';
import { Pedido } from './pedido.entity';
import { Repository } from 'typeorm';
import { PedidoItem } from './pedido-item.entity';

@Injectable()
export class PedidoRepository {
  constructor(
    @Inject('PEDIDO_REPOSITORY')
    private readonly pedidoRepository: Repository<Pedido>,
    @Inject('PEDIDO_ITEM_REPOSITORY')
    private readonly pedidoItemRepository: Repository<PedidoItem>,
  ) {}

  async findAll() {
    const all = await this.pedidoRepository.find();
    return all;
  }
  async save(pedido: Pedido) {
    const novoPedido = await this.pedidoRepository.save(pedido);
    await this.pedidoItemRepository
      .createQueryBuilder()
      .delete()
      .where('pedido_codigo_do_pedido = :pedido_codigo_do_pedido')
      .andWhere('produto_codigo_produto not in (:...produto_codigo_produto)')
      .setParameters({
        pedido_codigo_do_pedido: novoPedido.codigo_do_pedido,
        produto_codigo_produto: pedido.itens.map(i => i.produto.codigo_produto),
      })
      .execute();

    await this.pedidoItemRepository.save(
      pedido.itens.map(i => ({
        ...i,
        pedido: novoPedido,
      })),
    );

    return novoPedido;
  }
  async findOne(codigo_do_pedido: number) {
    return await this.pedidoRepository.findOne(codigo_do_pedido);
  }
  async delete(codigo_do_pedido: number) {
    await this.pedidoItemRepository
      .createQueryBuilder()
      .delete()
      .where('pedido_codigo_do_pedido = :pedido_codigo_do_pedido')
      .setParameters({
        pedido_codigo_do_pedido: codigo_do_pedido,
      })
      .execute();
    return await this.pedidoRepository.delete(codigo_do_pedido);
  }

  async findByCodigoCliente(codigo_cliente: number) {
    const pedidos = await this.pedidoRepository
      .createQueryBuilder()
      .select()
      .where('cliente_codigo_cliente = :codigo_cliente')
      .setParameters({
        codigo_cliente,
      })
      .getMany();
    return pedidos;
  }

  async findByCodigoProduto(codigo_produto: number) {
    const pedidos = await this.pedidoRepository
      .createQueryBuilder()
      .select()
      .where(
        'exists(select 1 from pedido_item where produto_codigo_produto = :codigo_produto and pedido_codigo_do_pedido = codigo_do_pedido)',
      )
      .setParameters({
        codigo_produto,
      })
      .getMany();
    return pedidos;
  }
}
