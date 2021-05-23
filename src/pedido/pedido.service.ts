import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ErroLoja } from '../error/erro-loja';
import { PedidoRepository } from './pedido.repository';
import * as consts from '../error/consts';
import _ = require('lodash');
import { PedidoSimple } from './pedido-simple';
import { EnumFormaPagamentoPedido, Pedido } from './pedido.entity';
import { ClienteService } from '../cliente/cliente.service';
import { ProdutoService } from '../produto/produto.service';
import { PedidoItem } from './pedido-item.entity';
import { EmailService } from '../email/email.service';
import { PdfReference, PdfService } from '../pdf/pdf.service';
@Injectable()
export class PedidoService {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    @Inject(forwardRef(() => ClienteService))
    private readonly clienteService: ClienteService,
    @Inject(forwardRef(() => ProdutoService))
    private readonly produtoService: ProdutoService,
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
  ) {}

  async findOne(codigo_do_pedido: number) {
    return await this.pedidoRepository.findOne(codigo_do_pedido);
  }

  async findAll() {
    const all = await this.pedidoRepository.findAll();
    return all;
  }

  private formaPagamentoValida(formaDePagamento) {
    return Object.values(EnumFormaPagamentoPedido).includes(formaDePagamento);
  }

  private validacoesGerais(pedido: PedidoSimple) {
    if (!pedido.codigo_cliente)
      throw new ErroLoja(consts.CLIENTE_PEDIDO_OBRIGATORIO);
    if (!pedido.data_do_pedido || isNaN(pedido.data_do_pedido.valueOf()))
      throw new ErroLoja(consts.DATA_PEDIDO_OBRIGATORIA);
    if (!pedido.forma_de_pagamento)
      throw new ErroLoja(consts.FORMA_DE_PAGAMENTO_PEDIDO_OBRIGATORIO);
    if (_.isEmpty(pedido.itens))
      throw new ErroLoja(consts.ITENS_PEDIDO_OBRIGATORIO_NAO_VAZIO);
    if (!this.formaPagamentoValida(pedido.forma_de_pagamento))
      throw new ErroLoja(consts.FORMA_DE_PAGAMENTO_PEDIDO_INVALIDA);
  }

  async delete(codigo_do_pedido: number) {
    return await this.pedidoRepository.delete(codigo_do_pedido);
  }

  async deleteByCodigoCliente(codigo_cliente: number) {
    const pedidos = await this.pedidoRepository.findByCodigoCliente(
      codigo_cliente,
    );
    await Promise.all(
      pedidos.map(p => p.codigo_do_pedido).map(c => this.delete(c)),
    );
  }

  async findByCodigoProduto(codigo_produto: number) {
    return await this.pedidoRepository.findByCodigoProduto(codigo_produto)
  }

  private async loadPedido(pedidoSimple: PedidoSimple): Promise<Pedido> {
    const pedido: Pedido = {
      codigo_do_pedido: pedidoSimple.codigo_do_pedido,
      cliente: await this.clienteService.findOne(pedidoSimple.codigo_cliente),
      data_do_pedido: pedidoSimple.data_do_pedido,
      forma_de_pagamento: pedidoSimple.forma_de_pagamento,
      observacao: pedidoSimple.observacao,
      itens: (
        await Promise.all(
          pedidoSimple.itens.map(async item => {
            const pedidoItem: PedidoItem = {
              pedido: null,
              quantidade: item.quantidade,
              produto: await this.produtoService.findOne(item.codigo_produto),
            };
            return pedidoItem;
          }),
        )
      ).filter(i => i.produto),
    };

    if (pedido.itens.length !== pedidoSimple.itens.length) {
      throw new ErroLoja(consts.ITENS_PEDIDO_NAO_ENCONTRADOS);
    }

    if (!pedido.cliente)
      throw new ErroLoja(consts.CLIENTE_PEDIDO_NAO_ENCONTRADO);

    if (pedido.itens.some(item => item.quantidade < 1))
      throw new ErroLoja(consts.QUANTIDADE_ITENM_PEDIDO_INVALIDA);

    return pedido;
  }

  async update(pedidoSimple: PedidoSimple) {
    pedidoSimple.codigo_do_pedido = +pedidoSimple.codigo_do_pedido;
    this.normalize(pedidoSimple);
    this.validacoesGerais(pedidoSimple);
    if (!(await this.pedidoRepository.findOne(pedidoSimple.codigo_do_pedido))) {
      throw new ErroLoja(consts.PEDIDO_NAO_ENCONTRADO);
    }

    const pedido = await this.loadPedido(pedidoSimple);
    return await this.pedidoRepository.save(pedido);
  }

  private async normalize(pedidoSimple: PedidoSimple) {
    pedidoSimple.data_do_pedido = new Date(pedidoSimple.data_do_pedido);
  }

  async insert(pedidoSimple: PedidoSimple) {
    if (pedidoSimple.codigo_do_pedido)
      throw new ErroLoja(consts.OPERACAO_NAO_PERMITIDA);
    this.normalize(pedidoSimple);
    this.validacoesGerais(pedidoSimple);
    const pedido = await this.loadPedido(pedidoSimple);
    return await this.pedidoRepository.save(pedido);
  }

  private simpleTemplate(pedido: Pedido, mode: 'pdf' | 'html'): string {
    return [
      'Obrigado pro comprar na Loja',
      'Seguem os detalhes do seu pedido',
      `Número do pedido: ${pedido.codigo_do_pedido}`,
      `Nome do cliente:  ${pedido.cliente.nome}`,
      `Email do cliente:  ${pedido.cliente.email}`,
      `CPF do cliente:  ${pedido.cliente.cpf}`,
      `Gênero do cliente:  ${pedido.cliente.cpf}`,
      ...pedido.itens.map(item => {
        return `${item.quantidade} unidade(s) de '${
          item.produto.nome
        }' por R$${item.produto.valor.toFixed(2)} (${(
          item.quantidade * item.produto.valor
        ).toFixed(2)})`;
      }),
      `Total do pedido: ${pedido.itens
        .reduce((a, p) => a + p.quantidade * p.produto.valor, 0)
        .toFixed(2)}`,
    ]
      .map(l => (mode === 'html' ? `<p>${l}</p>` : l))
      .join(mode === 'pdf' ? '\n' : '');
  }

  async sendEmail(codigo_do_pedido: number) {
    const pedido = await this.findOne(codigo_do_pedido);

    if (!pedido) {
      throw new ErroLoja(consts.PEDIDO_EMAIL_NAO_ENCONTRADO);
    }

    const html =
      '<html><body>' + this.simpleTemplate(pedido, 'html') + '</body></html>';

    await this.emailService.send({
      to: pedido.cliente.email,
      subject: 'Detalhes do Pedido',
      html,
    });
  }

  async gerarPdf(codigo_do_pedido: number): Promise<PdfReference> {
    const pedido = await this.findOne(codigo_do_pedido);

    if (!pedido) {
      throw new ErroLoja(consts.PEDIDO_PDF_NAO_ENCONTRADO);
    }

    return await this.pdfService.generate(this.simpleTemplate(pedido, 'pdf'));
  }
}
