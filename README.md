### Instalando

Para instalar o projeto utilize o comando 'npm install' via terminal

### Configurando o ambiente

Defina as variaveis de ambiente a seguir

- DATABASE_HOSTNAME padrão localhost
- DATABASE_PORT padrão 3306
- DATABASE_USERNAME padrão root
- DATABASE_PASSWORD obrigatório
- DATABASE_DATABASE obrigatório

- SERVER_PORT padrão 3000

Para utilizar a funcionalidade de envio de email defina as seguintes variaveis

- EMAIL_SMTP_HOST
- EMAIL_SMTP_PORT
- EMAIL_SMTP_AUTH_USER
- EMAIL_SMTP_AUTH_PASS
- EMAIL_SMTP_FROM

Segue tutorial de configuração do gmail para smtp: https://www.gmass.co/blog/gmail-smtp/

Exemplo de comando via terminal para definição das variaveis de ambiente
export DATABASE_HOSTNAME=localhost

## Executando

### Testes unitários

Para executar os testes unitários execute o comando 'npm run test' no terminal

### Executando em modo de desenvolvimento

Para executar os testes unitários execute o comando 'npm run start' no terminal

### Executando em modo de produção

Execute o build com 'npm run build' para realizar o build de produção e em seguida o comando 'npm run start:prod' para iniciar aplicação

## Postman

O arquivo Loja.postman_collection.json contém exemplos de requests para validação das rotas

## Pendencias

- Adicionar ferramenta que permita a composição de um email formatado a partir de um template
- Refatorar uso do jest para utilizar as vantagens do TypeScript
