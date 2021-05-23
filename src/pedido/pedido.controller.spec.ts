import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErroLoja } from '../error/erro-loja';
import { PedidoController } from './pedido.controller';
import { EnumFormaPagamentoPedido, Pedido } from './pedido.entity';
import { PedidoService } from './pedido.service';

const request = require('supertest');
jest.mock('./pedido.service');

describe('PedidoController', () => {
  const mockPedidoService = PedidoService as any;

  let app: INestApplication;
  beforeAll(async () => {
    mockPedidoService.mockClear();

    const module = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [PedidoService],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('teste listagem de todos os pedidos', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    const expectedValue: Pedido[] = [
      {
        codigo_do_pedido: 1,
        cliente: {
          codigo_cliente: 1,
        } as any,
        data_do_pedido: new Date().toISOString() as any,
        forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
        itens: [
          {
            produto: {
              codigo_produto: 1,
            },
            quantidade: 1,
          } as any,
        ],
      },
    ];
    serviceInstance.findAll.mockResolvedValue(expectedValue);

    return request(app.getHttpServer())
      .get('/pedidos')
      .set('Content-Type', 'application/json')
      .expect(200, expectedValue);
  });

  it('teste listagem único pedido', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    const expectedValue: Pedido = {
      codigo_do_pedido: 1,
      cliente: {
        codigo_cliente: 1,
      } as any,
      data_do_pedido: new Date().toISOString() as any,
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          produto: {
            codigo_produto: 1,
          },
          quantidade: 1,
        } as any,
      ],
    };
    serviceInstance.findOne.mockResolvedValue(expectedValue);
    return request(app.getHttpServer())
      .get('/pedidos/1')
      .set('Content-Type', 'application/json')
      .expect(200, expectedValue);
  });

  it('teste pedido não encontrado', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    serviceInstance.findOne.mockResolvedValue(null);
    return request(app.getHttpServer())
      .get('/pedidos/1')
      .set('Content-Type', 'application/json')
      .expect(200, '');
  });

  it('teste deleção pedido', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    await request(app.getHttpServer())
      .delete('/pedidos/1')
      .set('Content-Type', 'application/json')
      .expect(200);
    expect(serviceInstance.delete).toBeCalledWith(1);
  });

  it('teste criação pedido falha por erro de negocio', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];

    serviceInstance.insert.mockRejectedValue(
      new ErroLoja('Erro ao criar/cadastrar pedido'),
    );
    await request(app.getHttpServer())
      .post('/pedidos')
      .set('Content-Type', 'application/json')
      .expect(400);
  });

  it('teste criação alteração falha por erro de negocio', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];

    serviceInstance.update.mockRejectedValue(
      new ErroLoja('Erro ao criar/cadastrar pedido'),
    );
    await request(app.getHttpServer())
      .put('/pedidos/1')
      .set('Content-Type', 'application/json')
      .expect(400);
  });

  it('teste criação de pedido com sucesso', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    serviceInstance.insert.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/pedidos')
      .set('Content-Type', 'application/json')
      .expect(201);
  });

  it('teste alteração de pedido com sucesso', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    serviceInstance.update.mockResolvedValue(null);
    await request(app.getHttpServer())
      .put('/pedidos/1')
      .set('Content-Type', 'application/json')
      .expect(200);
  });

  it('teste chamada com sucesso para o endpoint email', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];
    await request(app.getHttpServer())
      .post('/pedidos/1/sendemail')
      .expect(201);
    expect(serviceInstance.sendEmail).toHaveBeenCalledWith(1);
  });

  it('teste chamada com sucesso para a geração de report', async () => {
    const serviceInstance = mockPedidoService.mock.instances[0];

    const descartar = jest.fn();
    serviceInstance.gerarPdf.mockResolvedValue({
      path: 'package.json',
      descartar,
    });

    await request(app.getHttpServer())
      .post('/pedidos/1/report')
      .expect(201);

    expect(serviceInstance.gerarPdf).toHaveBeenCalledWith(1);
    expect(descartar).toBeCalled();
  });
});
