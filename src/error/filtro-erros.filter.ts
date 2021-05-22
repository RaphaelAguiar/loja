import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import * as consts from './consts';
import { ErroLoja } from './erro-loja';

@Catch()
export class FiltroErros implements ExceptionFilter {
  private readonly logger = new Logger('FiltroErros', true);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof ErroLoja
        ? HttpStatus.BAD_REQUEST
        : HttpStatus.INTERNAL_SERVER_ERROR;

    //Não mostrar a mensagem de erro sem tratamento para o usuário final evita com que informações importantes para o funcionamento do sistema não
    //sejam expostas em caso de excessão, por exemplo primary keys, contraints e dados da arquitetura

    const message =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? consts.EXCESSAO_NAO_TRATADA
        : exception.message;

    response.status(status).json({
      message: message,
      statusCode: status,
    });

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }
  }
}
