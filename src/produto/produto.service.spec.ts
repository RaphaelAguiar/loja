import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoService } from './produto.service';
import { EnumCorProduto, Produto } from './produto.entity';
import { ProdutoRepository } from './produto.repository';
import { ErroLoja } from '../error/erro-loja';
import * as consts from '../error/consts';
import { PedidoService } from '../pedido/pedido.service';
jest.mock('./produto.repository');
jest.mock('../pedido/pedido.service');

describe('ProdutoService', () => {
  const mockProdutoRepository = ProdutoRepository as any;
  const mockPedidoService = PedidoService as any;
  let produtoService: ProdutoService;

  beforeEach(async () => {
    mockProdutoRepository.mockClear();
    mockPedidoService.mockClear();

    const app: TestingModule = await Test.createTestingModule({
      providers: [ProdutoRepository, ProdutoService, PedidoService],
    }).compile();

    produtoService = app.get<ProdutoService>(ProdutoService);
  });

  it('teste validação todos campos preenchidos no cadastro de produto', async () => {
    const novoProduto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    const variacoesTeste = [
      {
        omitir: 'nome',
        mensagem: consts.NOME_PRODUTO_OBRIGATORIO,
      },
      {
        omitir: 'cor',
        mensagem: consts.COR_PRODUTO_OBRIGATORIA,
      },
      {
        omitir: 'tamanho',
        mensagem: consts.TAMANHO_PRODUTO_OBRIGATORIO,
      },
      {
        omitir: 'valor',
        mensagem: consts.VALOR_PRODUTO_OBRIGATORIO,
      },
    ];

    const teste = async (omitir, mensagem) => {
      await expect(
        produtoService.insert(_.omit(novoProduto, omitir) as Produto),
      ).rejects.toEqual(new ErroLoja(mensagem));
    };

    await Promise.all(variacoesTeste.map(v => teste(v.omitir, v.mensagem)));
  });

  it('teste produto inserido com sucesso', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];

    const novoProduto: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    await produtoService.insert(novoProduto);

    expect(repositoryInstance.save).toHaveBeenCalledWith(novoProduto);
  });

  it('teste produto alterado com sucesso', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];

    const produtoAntes: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };
    const produtoDepois: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Azul,
      nome: 'produto 1 com novo nome',
      tamanho: 2,
      valor: 3,
    };
    repositoryInstance.findOne.mockResolvedValue(produtoAntes);
    await produtoService.update(produtoDepois);
    expect(repositoryInstance.save).toHaveBeenCalledWith(produtoDepois);
  });

  it('teste produto não encontrado na alteração', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    const produtoDepois: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };
    repositoryInstance.findOne.mockResolvedValue(null);
    await expect(produtoService.update(produtoDepois)).rejects.toEqual(
      new ErroLoja(consts.PRODUTO_NAO_ENCONTRADO),
    );
  });

  it('tester inserir com codigo produto', async () => {
    const novoProduto: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    await expect(produtoService.insert(novoProduto)).rejects.toEqual(
      new ErroLoja(consts.OPERACAO_NAO_PERMITIDA),
    );
  });

  it('teste deleção produto', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    await produtoService.delete(1);
    expect(repositoryInstance.delete).toBeCalledWith(1);
  });

  it('teste deleção produto em pedido', async () => {
    const pedidoServiceInstance = mockPedidoService.mock.instances[0];

    pedidoServiceInstance.findByCodigoProduto.mockResolvedValue([{}]);

    await expect(produtoService.delete(1)).rejects.toEqual(
      new ErroLoja(consts.NAO_PODE_SER_EXCLUIDO_PRESENTE_PEDIDO),
    );
  });

  it('teste busca todos produtos', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    const todosProdutos: Produto[] = [
      {
        codigo_produto: 1,
        cor: EnumCorProduto.Amarelo,
        nome: 'produto 1',
        tamanho: 1,
        valor: 2,
      },
      {
        codigo_produto: 2,
        cor: EnumCorProduto.Amarelo,
        nome: 'produto 2',
        tamanho: 3,
        valor: 4,
      },
    ];
    repositoryInstance.findAll.mockResolvedValue(todosProdutos);
    expect(await produtoService.findAll()).toEqual(todosProdutos);
  });

  it('teste busca unico produto encontrado', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    const produto: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };
    repositoryInstance.findOne.mockResolvedValue(produto);
    expect(await produtoService.findOne(1)).toEqual(produto);
    expect(repositoryInstance.findOne).toBeCalledWith(1);
  });

  it('teste busca unico não produto encontrado', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    repositoryInstance.findOne.mockResolvedValue(null);
    expect(await produtoService.findOne(2)).toEqual(null);
    expect(repositoryInstance.findOne).toBeCalledWith(2);
  });

  it('teste cor inválida', async () => {
    const novoProduto: Produto = {
      codigo_produto: null,
      cor: 'Cor foda do enum' as any,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };

    await expect(produtoService.insert(novoProduto)).rejects.toEqual(
      new ErroLoja(consts.COR_PRODUTO_INVALIDA),
    );
  });

  it('teste garante que o código do produto seja númerico ao passar no update', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    const produtoDepois: Produto = {
      codigo_produto: '1' as any,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 2,
    };
    repositoryInstance.findOne.mockResolvedValue({});
    await produtoService.update(produtoDepois as any);
    expect(repositoryInstance.save).toHaveBeenCalledWith({
      ...produtoDepois,
      codigo_produto: 1,
    });
  });

  it('teste validar insert valor produto >= 0', async () => {
    const produto1: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 0,
    };

    await expect(produtoService.insert(produto1)).rejects.toEqual(
      new ErroLoja(consts.VALOR_PRODUTO_INVALIDO),
    );

    const produto2: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: -1,
    };

    await expect(produtoService.insert(produto2)).rejects.toEqual(
      new ErroLoja(consts.VALOR_PRODUTO_INVALIDO),
    );
  });

  it('teste validar insert tamanho produto >= 0', async () => {
    const produto1: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 0,
      valor: 1,
    };

    await expect(produtoService.insert(produto1)).rejects.toEqual(
      new ErroLoja(consts.TAMANHO_PRODUTO_INVALIDO),
    );

    const produto2: Produto = {
      codigo_produto: null,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: -1,
      valor: 1,
    };

    await expect(produtoService.insert(produto2)).rejects.toEqual(
      new ErroLoja(consts.TAMANHO_PRODUTO_INVALIDO),
    );
  });

  it('teste validar update valor produto >= 0', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    repositoryInstance.findOne.mockResolvedValue({});

    const produto1: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: 0,
    };

    await expect(produtoService.update(produto1)).rejects.toEqual(
      new ErroLoja(consts.VALOR_PRODUTO_INVALIDO),
    );

    const produto2: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 1,
      valor: -1,
    };

    await expect(produtoService.update(produto2)).rejects.toEqual(
      new ErroLoja(consts.VALOR_PRODUTO_INVALIDO),
    );
  });

  it('teste validar update tamanho produto >= 0', async () => {
    const repositoryInstance = mockProdutoRepository.mock.instances[0];
    repositoryInstance.findOne.mockResolvedValue({});

    const produto1: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: 0,
      valor: 1,
    };

    await expect(produtoService.update(produto1)).rejects.toEqual(
      new ErroLoja(consts.TAMANHO_PRODUTO_INVALIDO),
    );

    const produto2: Produto = {
      codigo_produto: 1,
      cor: EnumCorProduto.Amarelo,
      nome: 'produto 1',
      tamanho: -1,
      valor: 1,
    };

    await expect(produtoService.update(produto2)).rejects.toEqual(
      new ErroLoja(consts.TAMANHO_PRODUTO_INVALIDO),
    );
  });
});
