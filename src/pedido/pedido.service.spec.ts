import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { PedidoService } from './pedido.service';
import { EnumFormaPagamentoPedido, Pedido } from './pedido.entity';
import { PedidoRepository } from './pedido.repository';
import { ErroLoja } from '../error/erro-loja';
import * as consts from '../error/consts';
import { PedidoSimple } from './pedido-simple';
import { ProdutoService } from '../produto/produto.service';
import { ClienteService } from '../cliente/cliente.service';
import { Cliente, EnumSexoCliente } from '../cliente/cliente.entity';
import { EnumCorProduto, Produto } from '../produto/produto.entity';
import { EmailService } from '../email/email.service';

jest.mock('./pedido.repository');
jest.mock('../produto/produto.service');
jest.mock('../cliente/cliente.service');
jest.mock('../email/email.service');

describe('PedidoService', () => {
  const mockPedidoRepository = PedidoRepository as any;
  const mockClienteService = ClienteService as any;
  const mockProdutoService = ProdutoService as any;
  const mockEmailService = EmailService as any;

  let pedidoService: PedidoService;

  beforeEach(async () => {
    mockPedidoRepository.mockClear();
    mockClienteService.mockClear();
    mockProdutoService.mockClear();
    mockEmailService.mockClear();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoRepository,
        PedidoService,
        ProdutoService,
        ClienteService,
        EmailService,
      ],
    }).compile();

    pedidoService = app.get<PedidoService>(PedidoService);
  });

  it('teste validação todos campos preenchidos no cadastro de pedido', async () => {
    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const variacoesTeste = [
      {
        omitir: 'codigo_cliente',
        mensagem: consts.CLIENTE_PEDIDO_OBRIGATORIO,
      },
      {
        omitir: 'itens',
        mensagem: consts.ITENS_PEDIDO_OBRIGATORIO_NAO_VAZIO,
      },
      {
        omitir: 'data_do_pedido',
        mensagem: consts.DATA_PEDIDO_OBRIGATORIA,
      },
      {
        omitir: 'forma_de_pagamento',
        mensagem: consts.FORMA_DE_PAGAMENTO_PEDIDO_OBRIGATORIO,
      },
    ];

    const teste = async (omitir, mensagem) => {
      await expect(
        pedidoService.insert(_.omit(novoPedido, omitir) as PedidoSimple),
      ).rejects.toEqual(new ErroLoja(mensagem));
    };

    await Promise.all(variacoesTeste.map(v => teste(v.omitir, v.mensagem)));
  });

  it('teste pedido inserido com sucesso', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const cliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    clienteServiceInstance.findOne.mockResolvedValue(cliente);
    produtoServiceInstance.findOne.mockResolvedValue(produto);

    await pedidoService.insert(novoPedido);

    expect(repositoryInstance.save).toHaveBeenCalledWith({
      cliente,
      codigo_do_pedido: novoPedido.codigo_do_pedido,
      data_do_pedido: novoPedido.data_do_pedido,
      forma_de_pagamento: novoPedido.forma_de_pagamento,
      itens: [
        {
          pedido: null,
          produto,
          quantidade: 1,
        },
      ],
    } as Pedido);
  });

  it('teste pedido alterado com sucesso', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const novoPedido: PedidoSimple = {
      codigo_do_pedido: 1,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const cliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    repositoryInstance.findOne.mockResolvedValue({});
    clienteServiceInstance.findOne.mockResolvedValue(cliente);
    produtoServiceInstance.findOne.mockResolvedValue(produto);

    await pedidoService.update(novoPedido);

    expect(repositoryInstance.save).toHaveBeenCalledWith({
      cliente,
      codigo_do_pedido: novoPedido.codigo_do_pedido,
      data_do_pedido: novoPedido.data_do_pedido,
      forma_de_pagamento: novoPedido.forma_de_pagamento,
      itens: [
        {
          pedido: null,
          produto,
          quantidade: 1,
        },
      ],
    } as Pedido);
  });

  it('teste pedido não encontrado na alteração', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const pedidoDepois: PedidoSimple = {
      codigo_do_pedido: 1,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };
    repositoryInstance.findOne.mockResolvedValue(null);
    await expect(pedidoService.update(pedidoDepois)).rejects.toEqual(
      new ErroLoja(consts.PEDIDO_NAO_ENCONTRADO),
    );
  });

  it('tester inserir com codigo pedido', async () => {
    const novoPedido: PedidoSimple = {
      codigo_do_pedido: 1,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    await expect(pedidoService.insert(novoPedido)).rejects.toEqual(
      new ErroLoja(consts.OPERACAO_NAO_PERMITIDA),
    );
  });

  it('teste deleção pedido', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    await pedidoService.delete(1);
    expect(repositoryInstance.delete).toBeCalledWith(1);
  });

  it('teste busca todos pedidos', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const todosPedidos: Pedido[] = [
      {
        codigo_do_pedido: 1,
        cliente: null,
        data_do_pedido: new Date(),
        forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
        itens: [
          {
            produto: null,
            pedido: null,
            quantidade: 1,
          },
        ],
      },
      {
        codigo_do_pedido: 2,
        cliente: null,
        data_do_pedido: new Date(),
        forma_de_pagamento: EnumFormaPagamentoPedido.Cheque,
        itens: [
          {
            produto: null,
            pedido: null,
            quantidade: 5,
          },
        ],
      },
    ];
    repositoryInstance.findAll.mockResolvedValue(todosPedidos);
    expect(await pedidoService.findAll()).toEqual(todosPedidos);
  });

  it('teste busca unico pedido encontrado', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const pedido: Pedido = {
      codigo_do_pedido: 1,
      cliente: null,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cheque,
      itens: [
        {
          produto: null,
          pedido: null,
          quantidade: 5,
        },
      ],
    };
    repositoryInstance.findOne.mockResolvedValue(pedido);
    expect(await pedidoService.findOne(1)).toEqual(pedido);
    expect(repositoryInstance.findOne).toBeCalledWith(1);
  });

  it('teste busca unico não pedido encontrado', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    repositoryInstance.findOne.mockResolvedValue(null);
    expect(await pedidoService.findOne(2)).toEqual(null);
    expect(repositoryInstance.findOne).toBeCalledWith(2);
  });

  it('teste garante que o código do pedido seja númerico ao passar no update', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const pedidoDepois: PedidoSimple = {
      codigo_do_pedido: 1,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const cliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    repositoryInstance.findOne.mockResolvedValue({});
    clienteServiceInstance.findOne.mockResolvedValue(cliente);
    produtoServiceInstance.findOne.mockResolvedValue(produto);

    await pedidoService.update(pedidoDepois as any);

    expect(repositoryInstance.save).toHaveBeenCalledWith({
      cliente,
      codigo_do_pedido: pedidoDepois.codigo_do_pedido,
      data_do_pedido: pedidoDepois.data_do_pedido,
      forma_de_pagamento: pedidoDepois.forma_de_pagamento,
      itens: [
        {
          pedido: null,
          produto,
          quantidade: 1,
        },
      ],
    } as Pedido);
  });

  it('Teste pedido referenciando produtos inexistentes', async () => {
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const cliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    clienteServiceInstance.findOne.mockResolvedValue(cliente);
    produtoServiceInstance.findOne.mockResolvedValue(null);

    await expect(pedidoService.insert(novoPedido)).rejects.toEqual(
      new ErroLoja(consts.ITENS_PEDIDO_NAO_ENCONTRADOS),
    );
  });

  it('validar se cliente do pedido existe', async () => {
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const produto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    clienteServiceInstance.findOne.mockResolvedValue(null);
    produtoServiceInstance.findOne.mockResolvedValue(produto);

    await expect(pedidoService.insert(novoPedido)).rejects.toEqual(
      new ErroLoja(consts.CLIENTE_PEDIDO_NAO_ENCONTRADO),
    );
  });

  it('validar forma de pagamento', async () => {
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: 'forma pagamento invalida' as any,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
      ],
    };

    const cliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    clienteServiceInstance.findOne.mockResolvedValue(cliente);
    produtoServiceInstance.findOne.mockResolvedValue(produto);

    await expect(pedidoService.insert(novoPedido)).rejects.toEqual(
      new ErroLoja(consts.FORMA_DE_PAGAMENTO_PEDIDO_INVALIDA),
    );
  });

  it('teste quantidades dos itens do pedido devem ser maior ou igual a 1', async () => {
    const clienteServiceInstance = mockClienteService.mock.instances[0];
    const produtoServiceInstance = mockProdutoService.mock.instances[0];

    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cheque,
      itens: [
        {
          codigo_produto: 1,
          quantidade: 1,
        },
        {
          codigo_produto: 2,
          quantidade: -1,
        },
      ],
    };

    const cliente: Cliente = {
      codigo_cliente: null,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    clienteServiceInstance.findOne.mockResolvedValue(cliente);
    produtoServiceInstance.findOne.mockResolvedValue(produto);

    await expect(pedidoService.insert(novoPedido)).rejects.toEqual(
      new ErroLoja(consts.QUANTIDADE_ITENM_PEDIDO_INVALIDA),
    );
  });

  it('teste pedido deve ter pelo menos 1 item', async () => {
    const novoPedido: PedidoSimple = {
      codigo_do_pedido: null,
      codigo_cliente: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Cartao,
      itens: [],
    };
    await expect(
      await expect(pedidoService.insert(novoPedido)).rejects.toEqual(
        new ErroLoja(consts.ITENS_PEDIDO_OBRIGATORIO_NAO_VAZIO),
      ),
    );
  });

  it('teste deleção por cliente', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    const pedidos = [
      {
        codigo_do_pedido: 1,
      },
      {
        codigo_do_pedido: 2,
      },
    ];
    repositoryInstance.findByCodigoCliente.mockResolvedValue(pedidos);
    await pedidoService.deleteByCodigoCliente(1);
    expect(repositoryInstance.findByCodigoCliente).toBeCalledWith(1);
    expect(repositoryInstance.delete).toHaveBeenCalledWith(1);
    expect(repositoryInstance.delete).toHaveBeenCalledWith(2);
  });

  it('teste busca pedido por produto', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];

    const cliente: Cliente = {
      codigo_cliente: 3,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: 2,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 2',
      tamanho: 1,
      valor: 2,
    };

    const pedidos: Pedido[] = [
      {
        cliente,
        codigo_do_pedido: 1,
        data_do_pedido: new Date(),
        forma_de_pagamento: EnumFormaPagamentoPedido.Dinheiro,
        itens: [
          {
            pedido: null,
            produto,
            quantidade: 1,
          },
        ],
      },
    ];

    repositoryInstance.findByCodigoProduto.mockResolvedValue(pedidos);

    const pedidosBanco = await pedidoService.findByCodigoProduto(1);

    expect(repositoryInstance.findByCodigoProduto).toBeCalledWith(1);

    expect(pedidos).toEqual(pedidosBanco);
  });

  it('testa envio de email com sucesso', async () => {
    const emailServiceInstance = mockEmailService.mock.instances[0];
    const repositoryInstance = mockPedidoRepository.mock.instances[0];

    const cliente: Cliente = {
      codigo_cliente: 3,
      cpf: '11111111111',
      email: 'email@gmail.com',
      nome: 'cliente da silva',
      sexo: EnumSexoCliente.Masculino,
    };

    const produto: Produto = {
      codigo_produto: 2,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 2',
      tamanho: 1,
      valor: 2,
    };
    const pedido: Pedido = {
      cliente,
      codigo_do_pedido: 1,
      data_do_pedido: new Date(),
      forma_de_pagamento: EnumFormaPagamentoPedido.Dinheiro,
      itens: [
        {
          pedido: null,
          produto,
          quantidade: 1,
        },
      ],
    };

    repositoryInstance.findOne.mockResolvedValue(pedido);
    await pedidoService.sendEmail(1);
    expect(emailServiceInstance.send).toBeCalled();
  });

  it('testa envio de email pedido não encontrado', async () => {
    const repositoryInstance = mockPedidoRepository.mock.instances[0];
    repositoryInstance.findOne.mockResolvedValue(null);
    await expect(pedidoService.sendEmail(1)).rejects.toEqual(
      new ErroLoja(consts.PEDIDO_EMAIL_NAO_ENCONTRADO),
    );
  });
});
