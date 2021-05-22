import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { PedidoItem } from './pedido-item.entity';

export enum EnumFormaPagamentoPedido {
  Dinheiro = 'dinheiro',
  Cartao = 'cartao',
  Cheque = 'cheque',
}

@Entity()
export class Pedido {
  @PrimaryColumn({
    generated: true,
  })
  codigo_do_pedido: number;

  @OneToMany(
    () => PedidoItem,
    item => item.pedido,
    {
      eager: true,
      persistence: false,
    },
  )
  itens: PedidoItem[];

  @ManyToOne(() => Cliente, {
    eager: true
  })
  cliente: Cliente;

  @Column()
  data_do_pedido: Date;

  @Column({ length: 1000, nullable: true })
  observacao?: string;

  @Column()
  forma_de_pagamento: EnumFormaPagamentoPedido;
}
