# Frontend Pilates

Aplicação React/Vite servida por Nginx em container Docker. Para desenvolvimento
local:

```powershell
npm ci
npm run dev
```

O cliente chama a API usando `/api`; em produção, o Nginx das instâncias web
encaminha esse caminho ao backend privado.

## Deploy na AWS

O workflow `.github/workflows/aws-deploy-dev.yml` publica automaticamente em
push para `develop`. Ele cria o build, publica a imagem em
`frontend/dev:<SHA do commit>` no ECR e faz deploy nas duas instâncias web via
Systems Manager. Antes do primeiro push, aplique o Terraform no repositório
`Infraestrutura` para criar o repositório ECR e configurar as instâncias.

Configure no repositório GitHub os secrets `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY` e `AWS_SECRET_SESSION_TOKEN`, além do environment
`development`. As credenciais precisam permitir push ao ECR, descoberta das
instâncias EC2 e comandos SSM.
