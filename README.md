# Competition Management BJJ API

API Firebase Functions para cadastro de usuários com histórico de alterações, deleção lógica e fluxo de aprovação de responsáveis.

Esta versão roda no Firebase Functions com banco de dados Firestore e autenticação Firebase.

## Instalação

```bash
npm install
```

## Configuração do Firebase

1. Instale o Firebase CLI: `npm install -g firebase-tools`
2. Faça login: `firebase login`
3. Inicialize o projeto: `firebase init` (selecione Functions e Firestore)
4. Configure o projeto em `.firebaserc` e `firebase.json`

## Variáveis de ambiente

Crie um arquivo local com as variáveis a partir do exemplo:

```bash
cp .env.example .env
```

### ⚠️ IMPORTANTE: Prefixos Reservados

Firebase Functions não permite variáveis com prefixos reservados. Por isso, usamos:
- `FB_` ao invés de `FIREBASE_` 
- `LOCAL_PORT` ao invés de `PORT`

Essas variáveis são automaticamente mapeadas no código.

### Variáveis Firebase e Autenticação

- `API_KEY_FILE` - nome do arquivo da chave API no bucket (ex: `api-key-secret.txt`)
- `GCP_TENANT_ID` - ID do tenant GCP para validação
- `FB_WEB_API_KEY` - chave da API web do Firebase para autenticação
- `FB_PROJECT_ID` - ID do projeto Firebase (padrão: `competition-management-bjj`)
- `FB_AUTH_DOMAIN` - domínio de autenticação Firebase (padrão: `competition-management-bjj.firebaseapp.com`)
- `FB_STORAGE_BUCKET` - bucket do Firebase Storage (ex: `gs://seu-projeto.firebasestorage.app`)
- `GOOGLE_APPLICATION_CREDENTIALS` - caminho para o arquivo service account JSON
- `MAIL_COLLECTION` - coleção Firestore monitorada para envio de e-mails (padrão: `mail`)

### Variáveis de Email (Nodemailer)

Para envio de emails via Nodemailer (em desenvolvimento ou sem a extensão do Firebase):

- `EMAIL_USER` - email do remetente (ex: seu.email@gmail.com)
- `EMAIL_PASSWORD` - senha da aplicação ou token (para Gmail, use App Passwords)
- `EMAIL_HOST` - servidor SMTP (padrão: `smtp.gmail.com`)
- `EMAIL_PORT` - porta SMTP (padrão: `587` para TLS)
- `EMAIL_FROM` - email que aparece como remetente (opcional, usa `EMAIL_USER` se não definido)

**Exemplo:**
```env
FB_WEB_API_KEY=AIzaSyCzR1BNHDehLBZNy13OXLi8rg4LDRryORs
FB_PROJECT_ID=competition-management-bjj
FB_AUTH_DOMAIN=competition-management-bjj.firebaseapp.com
FB_STORAGE_BUCKET=gs://competition-management-bjj.firebasestorage.app

EMAIL_USER=seu.email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

## Sistema de Envio de E-mails

O projeto suporta dois enfoques para envio de e-mails:

### Opção 1: Extensão Firebase (Recomendada para Produção)

Enfileira documentos na coleção Firestore (`MAIL_COLLECTION`) e a extensão oficial do Firebase os dispara:

- **Extensão**: `firebase/firestore-send-email`
- **Coleção**: definida em `MAIL_COLLECTION` (padrão: `mail`)
- **Uso**: Ideal para produção, sem necessidade de configurar credenciais SMTP

**Instalação:**
```bash
firebase ext:install firebase/firestore-send-email --project=SEU_PROJETO
```

### Opção 2: Nodemailer (Para Desenvolvimento ou Customização)

Se a extensão não estiver instalada, a função `dispatchEmail` (Firestore trigger) usa Nodemailer automaticamente:

- **Triguer**: `dispatchEmail` monitora a coleção `mail`
- **Serviço**: Nodemailer envia via SMTP
- **Configuração**: Via variáveis de ambiente `EMAIL_*`

**Uso**: Ideal para desenvolvimento local ou quando você precisa customizar o envio de emails

### Fluxo de Envio

```
1. API cria documento em Firestore: firestore.collection('mail').add({...})
2. Status documento: PENDING → PROCESSING → SENT/ERROR
3. Trigger dispatchEmail detecta novo documento
4. Tenta enviar via Nodemailer
5. Atualiza status e registra tentativas/erros
```

**Status do E-mail:**
- `PENDING` - Enfileirado, aguardando processamento
- `PROCESSING` - Trigger iniciou o envio
- `SENT` - Email enviado com sucesso
- `ERROR` - Falha no envio (com mensagem de erro)

**Campos do Documento:**
```javascript
{
  to: ["email@example.com"],
  message: {
    subject: "Título",
    text: "Conteúdo"
  },
  status: "PENDING|PROCESSING|SENT|ERROR",
  createdAt: "2026-04-25T...",
  updatedAt: "2026-04-25T...",
  sentAt?: "2026-04-25T...",
  errorMessage?: "Erro...",
  errorAt?: "2026-04-25T...",
  attempts: 1
}
```

## Desenvolvimento

```bash
npm run serve
```

## Execução Local usando Firebase Remoto

Este projeto pode rodar localmente usando `src/index.ts` como servidor Express, apontando para os serviços Firebase remotos.

### Comando para rodar localmente

```bash
npm run serve
```

### Comando para debug local

```bash
npm run serve:debug
```

### Observações

- Todas as requisições feitas localmente serão servidas em `http://localhost:3000`.
- A lógica de API roda localmente, mas Firestore/Auth/Storage são acessados no Firebase remoto.
- Não é necessário usar emulador para essa execução local.
- Você precisa ter credenciais Firebase configuradas no ambiente, por exemplo:
  - `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`
  - ou `gcloud auth application-default login`
- As variáveis de ambiente necessárias ainda são:
  - `API_KEY_FILE`
  - `GCP_TENANT_ID`
  - `FIREBASE_WEB_API_KEY`

### Endpoints de documentação

- Swagger UI: `GET http://localhost:3000/docs`
- OpenAPI JSON: `GET http://localhost:3000/swagger.json`
- Health do e-mail: `GET http://localhost:3000/health/email`

## Build

```bash
npm run build
```

## Arquitetura e Estrutura do Projeto

### Cloud Functions

O projeto possui **apenas 2 Cloud Functions**:

1. `users`
- Function HTTP única com o contexto completo da API
- Reúne toda a gestão de usuário, autenticação, aprovações, graduações, roles e Swagger
- Endpoints de documentação: `/docs` e `/swagger.json`

2. `dispatchEmail`
- Function Firestore Trigger para monitoria e disparo efetivo de e-mail
- Monitora a coleção definida em `MAIL_COLLECTION` (padrão `mail`)
- Controla status `PENDING`, `PROCESSING`, `SENT`, `ERROR`

## Deploy

### Via npm scripts

```bash
npm run deploy
```

### Via Scripts Shell

Este projeto inclui scripts shell para facilitar o deployment:

#### 1. Deploy Firebase Functions e Firestore

Faz deploy de Cloud Functions, regras e indexes do Firestore.

```bash
# Deploy das duas functions (users + dispatchEmail)
./scripts/deploy-functions.sh

# Deploy das duas functions (explícito)
./scripts/deploy-functions.sh functions

# Deploy apenas da API (function users)
./scripts/deploy-functions.sh users

# Alias legado para users
./scripts/deploy-functions.sh api

# Deploy apenas do disparo de e-mail
./scripts/deploy-functions.sh email

# Deploy completo: functions + firestore rules + indexes
./scripts/deploy-functions.sh all
```

**Opções disponíveis:**
- sem parâmetro ou `functions` - Deploy de `users` + `dispatchEmail`
- `users` - Deploy apenas da function `users`
- `api` - Alias para `users` (retrocompatibilidade)
- `email` - Deploy apenas da function `dispatchEmail`
- `all` - Deploy completo (functions, Firestore rules e indexes)

**O que faz:**
- Valida instalação do Firebase CLI
- Verifica autenticação Firebase
- Instala dependências (`npm install`)
- Compila TypeScript (`npm run build`)
- Deploy conforme opção selecionada:
  - `functions`: executa `firebase deploy --only functions:users,functions:dispatchEmail`
  - `users` (ou `api`): executa `firebase deploy --only functions:users`
  - `email`: executa `firebase deploy --only functions:dispatchEmail`
  - `all`: executa `firebase deploy` (tudo)

**Pré-requisitos:**
- Firebase CLI instalado: `npm install -g firebase-tools`
- Autenticado no Firebase: `firebase login`
- Projeto Firebase configurado em `firebase.json`

#### 2. Deploy/Serve da API

Inicia ou faz deploy da API em diferentes ambientes:

```bash
# Ambiente local (padrão)
./scripts/deploy-api.sh local

# Com debug
./scripts/deploy-api.sh serve:debug

# Info de produção
./scripts/deploy-api.sh production
```

**Opções disponíveis:**
- `local` - Inicia servidor local na porta 3000 (Express)
- `serve:debug` - Inicia servidor com inspetor node habilitado para debug
- `production` - Mostra instruções de deploy em produção

**O que faz:**
- Valida se está na raiz do projeto
- Instala dependências (`npm install`)
- Compila TypeScript (`npm run build`)
- Inicia servidor conforme ambiente selecionado

## Testes com Postman

Para testar a API localmente, importe os arquivos do Postman:

1. **Environment**: `postman/environments/Competition-Management-BJJ.postman_environment.json`
2. **Collection**: `postman/collections/Competition-Management-BJJ.postman_collection.json`

### Configuração do Environment

Antes de testar, configure as variáveis no environment:

- `api_key`: Defina com o conteúdo do seu arquivo de chave API
- `tenant_id`: Defina com seu tenant ID
- `firebase_token`: Obtenha fazendo login via a request "Login" e copie o token

### Ordem de Testes

1. **Login**: Faça login para obter o token Firebase
2. **Get Users**: Teste a listagem de usuários
3. **Create User**: Crie um novo usuário
4. **Update/Delete**: Teste atualização e deleção usando o ID do usuário criado

## Endpoints HTTP

## Endpoints HTTP

### Usuários

- `GET /users` - listar usuários ativos
- `GET /users/:id` - buscar usuário por ID
- `GET /users/:id/history` - histórico de alterações do usuário
- `POST /users` - criar novo usuário
- `PUT /users/:id` - atualizar usuário
- `DELETE /users/:id` - excluir usuário (soft delete)

### Autenticação

- `POST /login` - fazer login (requer `x-api-key` e `x-tenant-id`)

### Aprovações

- `GET /approvals` - listar solicitações de aprovação
- `POST /approvals/:id/respond` - aprova/rejeita solicitação de responsável

### Graduação

- `GET /graduations?birthDate=YYYY-MM-DD` - listar graduações válidas para a idade

### Roles

- `GET /roles` - listar roles/permissões disponíveis
- `GET /roles/:roleName/users` - listar usuários por role

### Documentação

- `GET /docs` - Swagger UI interativa
- `GET /swagger.json` - OpenAPI JSON schema

### Health Checks

- `GET /health/email` - verificar status do serviço de email

- `x-api-key` deve corresponder à chave privada armazenada em bucket do Google Cloud Storage
- `x-tenant-id` deve corresponder ao tenant GCP configurado em `GCP_TENANT_ID`
- `Authorization: Bearer <token>` deve conter o Firebase ID token para rotas protegidas
- a rota `POST /login` exige apenas `x-api-key` e `x-tenant-id`

## Documentação técnica

- documentação técnica em `docs/technical.md`

## Regras implementadas

- validação de graduação por idade
  - regra: considera apenas o ano de nascimento (mês e dia são desconsiderados)
- roles: `Aluno`, `responsável legal`, `responsável técnico`, `adm`
- aluno menor de 18 deve ter `responsibleLegalEmail`
- aluno deve ter `technicalResponsibleEmail`
- opções de responsável técnico e responsável legal são validadas por role existente
- histórico do estado anterior em `history` a cada alteração
- fotos de atletas podem ser salvas no Cloud Storage via `photoBase64`
