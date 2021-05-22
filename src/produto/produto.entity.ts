import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum EnumCorProduto {
  Vermelho = 'vermelho',
  Azul = 'azul',
  Amarelo = 'amarelo',
}

@Entity()
export class Produto {
  @PrimaryColumn({
    generated: true,
  })
  codigo_produto: number;

  @Column({ length: 500 })
  nome: string;

  @Column()
  cor: EnumCorProduto;

  @Column()
  tamanho: number;

  @Column()
  valor: number;
}
