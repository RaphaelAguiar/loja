import { forwardRef, Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { Pedido } from './pedido.entity';
import { Connection } from 'typeorm';
import { PedidoRepository } from './pedido.repository';
import { DatabaseModule } from '../database/database.module';
import { ClienteModule } from '../cliente/cliente.module';
import { ProdutoModule } from '../produto/produto.module';
import { PedidoItem } from './pedido-item.entity';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ClienteModule),
    forwardRef(() => ProdutoModule),
    EmailModule,
    PdfModule,
  ],
  controllers: [PedidoController],
  providers: [
    {
      provide: 'PEDIDO_REPOSITORY',
      useFactory: (connection: Connection) => connection.getRepository(Pedido),
      inject: ['DATABASE_CONNECTION'],
    },
    {
      provide: 'PEDIDO_ITEM_REPOSITORY',
      useFactory: (connection: Connection) =>
        connection.getRepository(PedidoItem),
      inject: ['DATABASE_CONNECTION'],
    },
    PedidoRepository,
    PedidoService,
  ],
  exports: [PedidoService],
})
export class PedidoModule {}
