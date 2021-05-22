import { Injectable } from '@nestjs/common';
import { ErroLoja } from '../error/erro-loja';
import { EnumCorProduto, Produto } from './produto.entity';
import { ProdutoRepository } from './produto.repository';
import { calcDv } from 'cpf-teste';
import * as consts from '../error/consts';
import _ = require('lodash');

@Injectable()
export class ProdutoService {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async findOne(codigo_produto: number) {
    return await this.produtoRepository.findOne(codigo_produto);
  }

  async findAll() {
    const all = await this.produtoRepository.findAll();
    return all;
  }

  private corValida(cor) {
    const coresValidas = Object.values(EnumCorProduto);
    return coresValidas.includes(cor);
  }

  private validacoesGerais(produto: Produto) {
    if (!produto.nome) throw new ErroLoja(consts.NOME_PRODUTO_OBRIGATORIO);
    if (!produto.cor) throw new ErroLoja(consts.COR_PRODUTO_OBRIGATORIA);
    if ([null, undefined].includes(produto.tamanho))
      throw new ErroLoja(consts.TAMANHO_PRODUTO_OBRIGATORIO);
    if ([null, undefined].includes(produto.valor))
      throw new ErroLoja(consts.VALOR_PRODUTO_OBRIGATORIO);

    if (!this.corValida(produto.cor))
      throw new ErroLoja(consts.COR_PRODUTO_INVALIDA);
    if (produto.tamanho <= 0) throw new ErroLoja(consts.TAMANHO_PRODUTO_INVALIDO);
    if (produto.valor <= 0) throw new ErroLoja(consts.VALOR_PRODUTO_INVALIDO);
  }

  async delete(codigo_produto: number) {
    return await this.produtoRepository.delete(codigo_produto);
  }

  async update(produto: Produto) {
    produto.codigo_produto = +produto.codigo_produto;
    this.validacoesGerais(produto);
    if (!(await this.produtoRepository.findOne(produto.codigo_produto))) {
      throw new ErroLoja(consts.PRODUTO_NAO_ENCONTRADO);
    }
    return await this.produtoRepository.save(produto);
  }

  async insert(produto: Produto) {
    if (produto.codigo_produto)
      throw new ErroLoja(consts.OPERACAO_NAO_PERMITIDA);
    this.validacoesGerais(produto);
    return await this.produtoRepository.save(produto);
  }
}
