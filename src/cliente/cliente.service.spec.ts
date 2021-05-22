import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from './cliente.service';
import { Cliente, EnumSexoCliente } from './cliente.entity';
import { ClienteRepository } from './cliente.repository';
import { PedidoService } from '../pedido/pedido.service';
import { ErroLoja } from '../error/erro-loja';
import * as consts from '../error/consts';
jest.mock('./cliente.repository');
jest.mock('../pedido/pedido.service');

describe('ClienteService', () => {
  const mockClienteRepository = ClienteRepository as any;
  const mockPedidoService = PedidoService as any;
  let clienteService: ClienteService;

  beforeEach(async () => {
    mockClienteRepository.mockClear();
    mockPedidoService.mockClear();

    const app: TestingModule = await Test.createTestingModule({
      providers: [ClienteRepository, ClienteService, PedidoService],
    }).compile();

    clienteService = app.get<ClienteService>(ClienteService);
  });

  it('teste validação todos campos preenchidos no cadastro de cliente', async () => {
    const novoCliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const variacoesTeste = [
      {
        omitir: 'cpf',
        mensagem: consts.CPF_CLINTE_OBRIGATORIO,
      },
      {
        omitir: 'email',
        mensagem: consts.EMAIL_CLIENTE_OBRIGATORIO,
      },
      {
        omitir: 'nome',
        mensagem: consts.NOME_CLIENTE_OBRIGATORIO,
      },
      {
        omitir: 'sexo',
        mensagem: consts.SEXO_CLIENTE_OBRIGATORIO,
      },
    ];

    const teste = async (omitir, mensagem) => {
      await expect(
        clienteService.insert(_.omit(novoCliente, omitir) as Cliente),
      ).rejects.toEqual(new ErroLoja(mensagem));
    };

    await Promise.all(variacoesTeste.map(v => teste(v.omitir, v.mensagem)));
  });

  it('teste cliente inserido com sucesso', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];

    const novoCliente: Cliente = {
      codigo_cliente: null,
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    await clienteService.insert(novoCliente);

    expect(repositoryInstance.save).toHaveBeenCalledWith(novoCliente);
  });

  it('teste cliente alterado com sucesso', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];

    const clienteAntes: Cliente = {
      codigo_cliente: null,
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };
    const clienteDepois: Cliente = {
      codigo_cliente: 1,
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente com novo nome',
      sexo: EnumSexoCliente.Masculino,
    };
    repositoryInstance.findOne.mockResolvedValue(clienteAntes);
    await clienteService.update(clienteDepois);
    expect(repositoryInstance.save).toHaveBeenCalledWith(clienteDepois);
  });

  it('teste cliente não encontrado na alteração', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];
    const clienteDepois: Cliente = {
      codigo_cliente: 1,
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente com novo nome',
      sexo: EnumSexoCliente.Masculino,
    };
    repositoryInstance.findOne.mockResolvedValue(null);
    await expect(clienteService.update(clienteDepois)).rejects.toEqual(
      new ErroLoja(consts.CLIENTE_NAO_ENCONTRADO),
    );
  });

  it('tester inserir com codigo cliente', async () => {
    const novoCliente: Cliente = {
      codigo_cliente: 1,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    await expect(clienteService.insert(novoCliente)).rejects.toEqual(
      new ErroLoja(consts.OPERACAO_NAO_PERMITIDA),
    );
  });

  it('teste email inválido', async () => {
    const novoCliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: null,
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };
    const emailsInvalidos = ['email1', 'aaa @gmail.com', 'aa@semsufixo'];

    const teste = async (cliente: Cliente) => {
      await expect(clienteService.insert(cliente)).rejects.toEqual(
        new ErroLoja(consts.EMAIL_CLIENTE_INVALIDO),
      );
    };
    await Promise.all(
      emailsInvalidos
        .map(email => ({
          ...novoCliente,
          email,
        }))
        .map(teste),
    );
  });

  it('teste cpf inválido', async () => {
    const novoCliente = {
      codigo_cliente: null,
      cpf: null,
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const cpfsInvalidos = ['12345678901', '11111111111', '22222222222'];

    const teste = async (cliente: Cliente) => {
      await expect(clienteService.insert(cliente)).rejects.toEqual(
        new ErroLoja(consts.CPF_CLIENTE_INVALIDO),
      );
    };
    await Promise.all(
      cpfsInvalidos
        .map(cpf => ({
          ...novoCliente,
          cpf,
        }))
        .map(teste),
    );
  });
  it('teste sexo inválido', async () => {
    const novoCliente: any = {
      codigo_cliente: null,
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: 'algum valor inválido',
    };

    await expect(clienteService.insert(novoCliente)).rejects.toEqual(
      new ErroLoja(consts.SEXO_CLIENTE_INVALIDO),
    );
  });

  it('teste deleção cliente', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];
    const pedidoServiceInstance = mockPedidoService.mock.instances[0];
    await clienteService.delete(1);
    expect(pedidoServiceInstance.deleteByCodigoCliente).toBeCalledWith(1);
    expect(repositoryInstance.delete).toBeCalledWith(1);
  });

  it('teste busca todos clientes', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];
    const todosClientes: Cliente[] = [
      {
        codigo_cliente: 1,
        cpf: '33399625103',
        email: 'email@gmail.com',
        nome: 'cliente com novo nome',
        sexo: EnumSexoCliente.Feminino,
      },
      {
        codigo_cliente: 2,
        cpf: '33399625103',
        email: 'email@gmail.com',
        nome: 'cliente com novo nome',
        sexo: EnumSexoCliente.Masculino,
      },
    ];
    repositoryInstance.findAll.mockResolvedValue(todosClientes);
    expect(await clienteService.findAll()).toEqual(todosClientes);
  });

  it('teste busca unico cliente encontrado', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];
    const cliente: Cliente = {
      codigo_cliente: 1,
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente com novo nome',
      sexo: EnumSexoCliente.Feminino,
    };
    repositoryInstance.findOne.mockResolvedValue(cliente);
    expect(await clienteService.findOne(1)).toEqual(cliente);
    expect(repositoryInstance.findOne).toBeCalledWith(1);
  });

  it('teste busca unico não cliente encontrado', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];
    repositoryInstance.findOne.mockResolvedValue(null);
    expect(await clienteService.findOne(2)).toEqual(null);
    expect(repositoryInstance.findOne).toBeCalledWith(2);
  });

  it('teste garante que o código do cliente seja númerico ao passar no update', async () => {
    const repositoryInstance = mockClienteRepository.mock.instances[0];
    const clienteDepois = {
      codigo_cliente: '1',
      cpf: '33399625103',
      email: 'email@gmail.com',
      nome: 'cliente com novo nome',
      sexo: EnumSexoCliente.Masculino,
    };
    repositoryInstance.findOne.mockResolvedValue({});
    await clienteService.update(clienteDepois as any);
    expect(repositoryInstance.save).toHaveBeenCalledWith({
      ...clienteDepois,
      codigo_cliente: 1,
    });
  });
});
