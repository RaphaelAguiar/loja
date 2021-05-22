import { forwardRef, Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { Cliente } from './cliente.entity';
import { Connection } from 'typeorm';
import { ClienteRepository } from './cliente.repository';
import { DatabaseModule } from '../database/database.module';
import { PedidoModule } from '../pedido/pedido.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => PedidoModule)],
  controllers: [ClienteController],
  providers: [
    {
      provide: 'CLIENTE_REPOSITORY',
      useFactory: (connection: Connection) => connection.getRepository(Cliente),
      inject: ['DATABASE_CONNECTION'],
    },
    ClienteRepository,
    ClienteService,
  ],
  exports: [ClienteService],
})
export class ClienteModule {}
