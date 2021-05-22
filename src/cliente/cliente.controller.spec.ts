import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErroLoja } from '../error/erro-loja';
import { ClienteController } from './cliente.controller';
import { Cliente, EnumSexoCliente } from './cliente.entity';
import { ClienteService } from './cliente.service';
const request = require('supertest');
jest.mock('./cliente.service');

describe('ClienteController', () => {
  const mockClienteService = ClienteService as any;
  let app: INestApplication;
  beforeAll(async () => {
    mockClienteService.mockClear();

    const module = await Test.createTestingModule({
      controllers: [ClienteController],
      providers: [ClienteService],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('teste listagem de todos os clientes', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];
    const expectedValue: Cliente[] = [
      {
        codigo_cliente: 1,
        cpf: 'cpf',
        email: 'email',
        nome: 'nome',
        sexo: EnumSexoCliente.Masculino,
      },
    ];
    serviceInstance.findAll.mockResolvedValue(expectedValue);

    return request(app.getHttpServer())
      .get('/clientes')
      .set('Content-Type', 'application/json')
      .expect(200, expectedValue);
  });

  it('teste listagem único cliente', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];
    const expectedValue: Cliente = {
      codigo_cliente: 1,
      cpf: 'cpf',
      email: 'email',
      nome: 'nome',
      sexo: EnumSexoCliente.Masculino,
    };
    serviceInstance.findOne.mockResolvedValue(expectedValue);
    return request(app.getHttpServer())
      .get('/clientes/1')
      .set('Content-Type', 'application/json')
      .expect(200, expectedValue);
  });

  it('teste cliente não encontrado', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];
    serviceInstance.findOne.mockResolvedValue(null);
    return request(app.getHttpServer())
      .get('/clientes/1')
      .set('Content-Type', 'application/json')
      .expect(200, '');
  });

  it('teste deleção cliente', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];
    await request(app.getHttpServer())
      .delete('/clientes/1')
      .set('Content-Type', 'application/json')
      .expect(200);
    expect(serviceInstance.delete).toBeCalledWith(1);
  });

  it('teste criação cliente falha por erro de negocio', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];

    serviceInstance.insert.mockRejectedValue(
      new ErroLoja('Erro ao criar/cadastrar cliente'),
    );
    await request(app.getHttpServer())
      .post('/clientes')
      .set('Content-Type', 'application/json')
      .expect(400);
  });

  it('teste criação alteração falha por erro de negocio', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];

    serviceInstance.update.mockRejectedValue(
      new ErroLoja('Erro ao criar/cadastrar cliente'),
    );
    await request(app.getHttpServer())
      .put('/clientes/1')
      .set('Content-Type', 'application/json')
      .expect(400);
  });

  it('teste criação de cliente com sucesso', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];
    serviceInstance.insert.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/clientes')
      .set('Content-Type', 'application/json')
      .expect(201);
  });

  it('teste alteração de cliente com sucesso', async () => {
    const serviceInstance = mockClienteService.mock.instances[0];
    serviceInstance.update.mockResolvedValue(null);
    await request(app.getHttpServer())
      .put('/clientes/1')
      .set('Content-Type', 'application/json')
      .expect(200);
  });
});
