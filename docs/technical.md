# Documento Técnico da API Competition Management BJJ

## Visão geral

Esta API controla usuários atletas de Jiu Jitsu, incluindo dados pessoais, graduação, papéis, relacionamentos de responsáveis legais e técnicos, autenticação e histórico de alterações.

## Principais funcionalidades

1. Cadastro de usuário
   - campos obrigatórios: `fullName`, `birthDate`, `weight`, `graduation`, `email`, `phone`, `roles`, `password`
   - campo `photoBase64` opcional para upload da foto do atleta no Google Cloud Storage
   - `roles` pode conter múltiplos valores, incluindo: `Aluno`, `responsável legal`, `responsável técnico`, `adm`
   - o usuário recebe um campo `passwordHash` armazenado com bcrypt

2. Atualização de usuário
   - salva um histórico do estado anterior em `history`
   - aceita atualização de foto via `photoBase64`
   - aceita atualização de senha via campo `password` opcional
   - mantém validações de graduação, responsáveis e roles

3. Exclusão lógica
   - em vez de remover o registro, o usuário recebe `deletedAt`
   - usuários com `deletedAt` não aparecem nas listagens ativas

4. Histórico de alterações
   - cada alteração adiciona um snapshot do usuário anterior em `history`
   - o snapshot exclui o `passwordHash` para segurança

5. Aprovação de relacionamentos
   - quando `responsibleLegalEmail` é preenchido, cria-se uma solicitação de aprovação do responsável legal
   - quando `technicalResponsibleEmail` é preenchido, cria-se uma solicitação de aprovação do responsável técnico
   - o responsável deve aprovar ou rejeitar via `POST /approvals/{id}/respond`
   - se rejeitado, o relacionamento é removido do usuário

6. Autenticação e emissão de token
   - login via `POST /login` com `email` e `password`
   - gera token JWT expirável em 30 minutos
   - o token pode ser usado no futuro para autenticação e emissão de FCM tokens

7. Documentação Swagger
   - documentação interativa disponível em `/docs`
   - o arquivo OpenAPI é mantido em `src/swagger.ts`

## Regras de negócio atuais

### Graduação por idade
- até 15 anos:
  - branca
  - cinza com branco
  - cinza
  - cinza com preto
  - amarela com branco
  - amarela
  - amarela com preto
  - laranja com branco
  - laranja
  - laranja com preto
  - verde com branco
  - verde
  - verde com preto

- acima de 15 anos:
  - branca
  - azul
  - roxa
  - marrom
  - preta

### Regras para `Aluno`
- deve preencher `technicalResponsibleEmail`
- para menores de 18 anos, deve preencher `responsibleLegalEmail`
- `responsibleLegalEmail` deve pertencer a um usuário com role `responsável legal`
- `technicalResponsibleEmail` deve pertencer a um usuário com role `responsável técnico`

### IDs e histórico
- cada usuário possui `id` UUID
- `history` guarda registros anteriores do usuário
- `deletedAt` indica exclusão lógica

### Segurança
- senha é gerenciada pelo Firebase Authentication
- login gera Firebase ID token via REST API
- o Firebase ID token é usado para autenticação em rotas protegidas
- as rotas protegidas usam middleware de validação
  - `x-api-key` deve corresponder à chave secreta armazenada no bucket do Google Cloud Storage
  - `x-tenant-id` deve corresponder ao tenant GCP configurado em `GCP_TENANT_ID`
  - `Authorization: Bearer <token>` deve conter o Firebase ID token para rotas protegidas de usuário e aprovação

Este documento deve ser mantido sincronizado com a API à medida que novas funcionalidades e regras de negócio são adicionadas.
