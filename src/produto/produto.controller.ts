import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';
import { FiltroErros } from '../error/filtro-erros.filter';
import { Produto } from './produto.entity';
import { ProdutoService } from './produto.service';

@Controller('produtos')
@UseFilters(new FiltroErros())
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  async findAll() {
    const all = await this.produtoService.findAll();
    return all;
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo_produto: number) {
    const one = await this.produtoService.findOne(+codigo_produto);
    return one;
  }

  @Post()
  async insert(@Body() produto: Produto) {
    return await this.produtoService.insert(produto);
  }

  @Put(':codigo')
  async update(
    @Param('codigo') codigo_produto: number,
    @Body() produto: Produto,
  ) {
    return await this.produtoService.update({
      ...produto,
      codigo_produto: +codigo_produto,
    });
  }

  @Delete(':codigo')
  async delete(@Param('codigo') codigo_produto: number) {
    return await this.produtoService.delete(+codigo_produto);
  }
}
