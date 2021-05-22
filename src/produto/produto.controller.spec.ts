import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErroLoja } from '../error/erro-loja';
import { ProdutoController } from './produto.controller';
import { EnumCorProduto, Produto } from './produto.entity';
import { ProdutoService } from './produto.service';
const request = require('supertest');
jest.mock('./produto.service');

describe('ProdutoController', () => {
  const mockProdutoService = ProdutoService as any;
  let app: INestApplication;
  beforeAll(async () => {
    mockProdutoService.mockClear();

    const module = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [ProdutoService],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('teste listagem de todos os produtos', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];
    const expectedValue: Produto[] = [
      {
        codigo_produto: 1,
        cor: EnumCorProduto.Amarelo,
        nome: 'produto 1',
        tamanho: 1,
        valor: 2,
      },
    ];
    serviceInstance.findAll.mockResolvedValue(expectedValue);

    return request(app.getHttpServer())
      .get('/produtos')
      .set('Content-Type', 'application/json')
      .expect(200, expectedValue);
  });

  it('teste listagem único produto', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];
    const expectedValue: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };
    serviceInstance.findOne.mockResolvedValue(expectedValue);
    return request(app.getHttpServer())
      .get('/produtos/1')
      .set('Content-Type', 'application/json')
      .expect(200, expectedValue);
  });

  it('teste produto não encontrado', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];
    serviceInstance.findOne.mockResolvedValue(null);
    return request(app.getHttpServer())
      .get('/produtos/1')
      .set('Content-Type', 'application/json')
      .expect(200, '');
  });

  it('teste deleção produto', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];
    await request(app.getHttpServer())
      .delete('/produtos/1')
      .set('Content-Type', 'application/json')
      .expect(200);
    expect(serviceInstance.delete).toBeCalledWith(1);
  });

  it('teste criação produto falha por erro de negocio', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];

    serviceInstance.insert.mockRejectedValue(
      new ErroLoja('Erro ao criar/cadastrar produto'),
    );
    await request(app.getHttpServer())
      .post('/produtos')
      .set('Content-Type', 'application/json')
      .expect(400);
  });

  it('teste criação alteração falha por erro de negocio', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];

    serviceInstance.update.mockRejectedValue(
      new ErroLoja('Erro ao criar/cadastrar produto'),
    );
    await request(app.getHttpServer())
      .put('/produtos/1')
      .set('Content-Type', 'application/json')
      .expect(400);
  });

  it('teste criação de produto com sucesso', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];
    serviceInstance.insert.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/produtos')
      .set('Content-Type', 'application/json')
      .expect(201);
  });

  it('teste alteração de produto com sucesso', async () => {
    const serviceInstance = mockProdutoService.mock.instances[0];
    serviceInstance.update.mockResolvedValue(null);
    await request(app.getHttpServer())
      .put('/produtos/1')
      .set('Content-Type', 'application/json')
      .expect(200);
  });
});
