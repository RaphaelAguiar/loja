import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum EnumSexoCliente {
  Masculino = 'masculino',
  Feminino = 'feminino',
}

@Entity()
export class Cliente {
  @PrimaryColumn({
    generated: true,
  })
  codigo_cliente: number;

  @Column({ length: 500 })
  nome: string;

  @Column({ length: 11 })
  cpf: string;

  @Column()
  sexo: EnumSexoCliente;

  @Column({ length: 500 })
  email: string;
}
