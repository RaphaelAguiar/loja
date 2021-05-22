export class ErroLoja extends Error {
  readonly type = 'ErroLoja';
  constructor(mensagem: string) {
    super(mensagem);
  }
}