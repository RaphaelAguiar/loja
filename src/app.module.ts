import { Module } from '@nestjs/common';
import { ClienteModule } from './cliente/cliente.module';
import { ProdutoModule } from './produto/produto.module';

@Module({
  imports: [ClienteModule, ProdutoModule],
})
export class AppModule {}
