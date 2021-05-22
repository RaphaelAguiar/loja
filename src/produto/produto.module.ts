import { Module } from '@nestjs/common';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';
import { Connection } from 'typeorm';
import { ProdutoRepository } from './produto.repository';
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [ProdutoController],
  providers: [
    {
      provide: 'PRODUTO_REPOSITORY',
      useFactory: (connection: Connection) => connection.getRepository(Produto),
      inject: ['DATABASE_CONNECTION'],
    },
    ProdutoRepository,
    ProdutoService,
  ],
})
export class ProdutoModule {}
