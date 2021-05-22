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
import { Cliente } from './cliente.entity';
import { ClienteService } from './cliente.service';

@Controller('clientes')
@UseFilters(new FiltroErros())
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  async findAll() {
    const all = await this.clienteService.findAll();
    return all;
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo_cliente: number) {
    const one = await this.clienteService.findOne(+codigo_cliente);
    return one;
  }

  @Post()
  async insert(@Body() cliente: Cliente) {
    return await this.clienteService.insert(cliente);
  }

  @Put(':codigo')
  async update(
    @Param('codigo') codigo_cliente: number,
    @Body() cliente: Cliente,
  ) {
    return await this.clienteService.update({
      ...cliente,
      codigo_cliente: +codigo_cliente,
    });
  }

  @Delete(':codigo')
  async delete(@Param('codigo') codigo_cliente: number) {
    return await this.clienteService.delete(+codigo_cliente);
  }
}
