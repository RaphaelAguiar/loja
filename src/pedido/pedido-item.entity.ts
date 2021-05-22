import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Produto } from '../produto/produto.entity';
import { Pedido } from './pedido.entity';

@Entity()
export class PedidoItem {
  @Column()
  quantidade: number;

  @ManyToOne(() => Produto, {
    primary: true,
    eager: true,
  })
  produto: Produto;

  @ManyToOne(() => Pedido, {
    primary: true,
  })
  pedido: Pedido;
}
