import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Res,
  UseFilters,
} from '@nestjs/common';
import { FiltroErros } from '../error/filtro-erros.filter';
import { PedidoSimple } from './pedido-simple';
import { PedidoService } from './pedido.service';
import { Response } from 'express';

@Controller('pedidos')
@UseFilters(new FiltroErros())
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Get()
  async findAll() {
    const all = await this.pedidoService.findAll();
    return all;
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo_do_pedido: number) {
    const one = await this.pedidoService.findOne(+codigo_do_pedido);
    return one;
  }

  @Post()
  async insert(@Body() pedido: PedidoSimple) {
    return await this.pedidoService.insert(pedido);
  }

  @Put(':codigo')
  async update(
    @Param('codigo') codigo_do_pedido: number,
    @Body() pedido: PedidoSimple,
  ) {
    return await this.pedidoService.update({
      ...pedido,
      codigo_do_pedido: +codigo_do_pedido,
    });
  }

  @Delete(':codigo')
  async delete(@Param('codigo') codigo_do_pedido: number) {
    return await this.pedidoService.delete(+codigo_do_pedido);
  }

  @Post(':codigo/sendemail')
  async sendEmail(@Param('codigo') codigo_do_pedido: number) {
    return await this.pedidoService.sendEmail(+codigo_do_pedido);
  }

  @Post(':codigo/report')
  @Header('Content-Type', 'application/pdf')
  async report(@Param('codigo') codigo_do_pedido: number, @Res() res: Response) {
    const reference = await this.pedidoService.gerarPdf(+codigo_do_pedido);
    res.sendFile(
      reference.path,
      {
        root: process.cwd(),
      },
      err => {
        if (err) {
          throw err;
        }
        reference.descartar();
      },
    );
  }
}
