import { EnumFormaPagamentoPedido } from './pedido.entity';

export interface PedidoSimple {
  codigo_do_pedido: number;
  codigo_cliente: number;
  data_do_pedido: Date;
  observacao?: string;
  forma_de_pagamento: EnumFormaPagamentoPedido;
  itens: {
    codigo_produto: number;
    quantidade: number;
  }[];
}
