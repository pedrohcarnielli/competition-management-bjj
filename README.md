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

- `API_KEY_BUCKET` - nome do bucket do Cloud Storage para a chave API
- `API_KEY_FILE` - nome do arquivo da chave API no bucket
- `GCP_TENANT_ID` - ID do tenant GCP para validação
- `FIREBASE_WEB_API_KEY` - chave da API web do Firebase para autenticação
- `FIREBASE_MAIL_COLLECTION` - coleção Firestore monitorada para envio real de e-mails (padrão: `mail`)

## Envio real de e-mails via Firebase

O projeto envia e-mails enfileirando documentos na coleção Firestore definida em `FIREBASE_MAIL_COLLECTION`.
Para o envio efetivo, instale e configure a extensão oficial **Trigger Email** do Firebase:

- Extensão: `firebase/firestore-send-email`
- Coleção padrão monitorada: `mail`

Sem a extensão instalada/configurada, os documentos serão criados no Firestore, mas os e-mails não serão disparados.

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

## Deploy

### Via npm scripts

```bash
npm run deploy
```

### Via Scripts Shell

Este projeto inclui scripts shell para facilitar o deployment:

#### 1. Deploy Firebase Functions e Firestore

Faz deploy de Cloud Functions, regras e indexes do Firestore:

```bash
# Deploy apenas das functions (padrão)
./scripts/deploy-functions.sh

# Deploy apenas das functions (explícito)
./scripts/deploy-functions.sh functions

# Deploy completo: functions + firestore rules + indexes
./scripts/deploy-functions.sh all
```

**Opções disponíveis:**
- sem parâmetro ou `functions` - Deploy apenas das Cloud Functions
- `all` - Deploy completo (functions, Firestore rules e indexes)

**O que faz:**
- Valida instalação do Firebase CLI
- Verifica autenticação Firebase
- Instala dependências (`npm install`)
- Compila TypeScript (`npm run build`)
- Deploy conforme opção selecionada:
  - `functions`: executa `firebase deploy --only functions`
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

## Funções disponíveis

- `getUsers` - listar usuários ativos
- `getUserById` - buscar usuário por ID
- `getUserHistory` - histórico de usuário
- `createUserFunction` - criar usuário
- `updateUserFunction` - atualizar usuário
- `deleteUserFunction` - excluir usuário
- `login` - fazer login
- `getApprovalsFunction` - listar aprovações
- `respondApprovalFunction` - responder aprovação
- `getGraduations` - listar graduações por idade
- `GET /users/:id` - consulta um usuário
- `GET /users/:id/history` - histórico de alterações do usuário
- `GET /approvals` - lista solicitações de aprovação
- `POST /approvals/:id/respond` - aprova/rejeita solicitação
- `GET /graduations?birthDate=YYYY-MM-DD` - lista graduações válidas para a idade
- `GET /docs` - documentação Swagger interativa

## Chaves e autenticação

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
