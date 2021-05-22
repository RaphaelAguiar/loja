import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ErroLoja } from '../error/erro-loja';
import { Cliente, EnumSexoCliente } from './cliente.entity';
import { ClienteRepository } from './cliente.repository';
import { calcDv } from 'cpf-teste';
import * as consts from '../error/consts';
import _ = require('lodash');
import { PedidoService } from '../pedido/pedido.service';

@Injectable()
export class ClienteService {
  private readonly regexEmailValido = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(
    private readonly clienteRepository: ClienteRepository,
    @Inject(forwardRef(() => PedidoService))
    private readonly pedidoService: PedidoService,
  ) {}

  async findOne(codigo_cliente: number) {
    return await this.clienteRepository.findOne(codigo_cliente);
  }

  async findAll() {
    const all = await this.clienteRepository.findAll();
    return all;
  }

  private cpfValido(cpf: string) {
    if (cpf.length !== 11) return false;
    if (_.uniq(cpf.split('')).length === 1) {
      return false;
    }
    const [d1, d2] = calcDv(cpf.slice(0, 9));
    return d1 === +cpf[9] && d2 === +cpf[10];
  }

  private sexoValido(sexo) {
    return (
      sexo === EnumSexoCliente.Masculino || sexo === EnumSexoCliente.Feminino
    );
  }

  private validacoesGerais(cliente: Cliente) {
    if (!cliente.cpf) throw new ErroLoja(consts.CPF_CLINTE_OBRIGATORIO);
    if (!cliente.email) throw new ErroLoja(consts.EMAIL_CLIENTE_OBRIGATORIO);
    if (!cliente.nome) throw new ErroLoja(consts.NOME_CLIENTE_OBRIGATORIO);
    if (!cliente.sexo) throw new ErroLoja(consts.SEXO_CLIENTE_OBRIGATORIO);

    if (!this.regexEmailValido.test(cliente.email))
      throw new Error(consts.EMAIL_CLIENTE_INVALIDO);
    if (!this.cpfValido(cliente.cpf))
      throw new ErroLoja(consts.CPF_CLIENTE_INVALIDO);
    if (!this.sexoValido(cliente.sexo))
      throw new ErroLoja(consts.SEXO_CLIENTE_INVALIDO);
  }

  async delete(codigo_cliente: number) {
    await this.pedidoService.deleteByCodigoCliente(codigo_cliente);
    return await this.clienteRepository.delete(codigo_cliente);
  }

  async update(cliente: Cliente) {
    cliente.codigo_cliente = +cliente.codigo_cliente;
    this.validacoesGerais(cliente);
    if (!(await this.clienteRepository.findOne(cliente.codigo_cliente))) {
      throw new ErroLoja(consts.CLIENTE_NAO_ENCONTRADO);
    }
    return await this.clienteRepository.save(cliente);
  }

  async insert(cliente: Cliente) {
    if (cliente.codigo_cliente)
      throw new ErroLoja(consts.OPERACAO_NAO_PERMITIDA);
    this.validacoesGerais(cliente);
    return await this.clienteRepository.save(cliente);
  }
}
