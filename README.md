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

- `API_KEY_BUCKET` - nome do bucket do Cloud Storage para a chave API
- `API_KEY_FILE` - nome do arquivo da chave API no bucket
- `GCP_TENANT_ID` - ID do tenant GCP para validação
- `FIREBASE_WEB_API_KEY` - chave da API web do Firebase para autenticação

## Desenvolvimento

```bash
npm run serve
```

## Build

```bash
npm run build
```

## Deploy

```bash
npm run deploy
```

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
- roles: `Aluno`, `responsável legal`, `responsável técnico`, `adm`
- aluno menor de 18 deve ter `responsibleLegalEmail`
- aluno deve ter `technicalResponsibleEmail`
- opções de responsável técnico e responsável legal são validadas por role existente
- histórico do estado anterior em `history` a cada alteração
- fotos de atletas podem ser salvas no Cloud Storage via `photoBase64`
