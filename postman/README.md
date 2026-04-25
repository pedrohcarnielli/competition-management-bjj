# Testes com Postman - Competition Management BJJ API

Este documento explica como configurar e usar o Postman para testar a API Firebase Functions localmente.

## Arquivos Necessários

- `environments/Competition-Management-BJJ.postman_environment.json` - Environment com variáveis
- `collections/Competition-Management-BJJ.postman_collection.json` - Collection com todas as requests

## Configuração Inicial

### 1. Importar no Postman

1. Abra o Postman
2. Clique em "Import" (botão no topo esquerdo)
3. Selecione "File"
4. Importe primeiro o environment: `postman/environments/Competition-Management-BJJ.postman_environment.json`
5. Depois importe a collection: `postman/collections/Competition-Management-BJJ.postman_collection.json`

### 2. Configurar Environment

Selecione o environment "Competition Management BJJ - Local" no dropdown no canto superior direito.

Configure as seguintes variáveis:

- `base_url`: Já configurado para o emulador local
- `api_key`: **IMPORTANTE** - Defina com o conteúdo do seu arquivo `api-key-secret.txt`
- `tenant_id`: Defina com seu tenant ID (ex: "competition-bjj-2024")
- `firebase_token`: Deixe em branco por enquanto, será preenchido no login
- `user_id`: Deixe em branco por enquanto, será usado para operações específicas
- `approval_id`: Deixe em branco por enquanto, será usado para operações de aprovação
- `birth_date`: Data de nascimento para cálculos de graduação (formato: YYYY-MM-DD, ex: "2000-01-01")

### 3. Iniciar o Emulador

Antes de testar, certifique-se que o emulador está rodando:

```bash
npm run serve
```

## Ordem de Testes Recomendada

### 1. Teste Básico - Verificar se API responde

Execute a request **"Get All Users"** (mesmo que falhe por falta de auth, deve retornar erro de API key).

### 2. Login - Obter Token Firebase

1. Vá para a pasta "Authentication" > "Login"
2. Modifique o body com email e senha válidos (ou crie um usuário primeiro)
3. Execute a request
4. Copie o token da resposta e cole na variável `firebase_token` do environment

### 3. Listar Usuários

Execute **"Get All Users"** - deve retornar lista vazia inicialmente.

### 4. Criar Usuário

1. Vá para "Users" > "Create User"
2. Modifique os dados no body (remova photoBase64 se não quiser testar upload)
3. Execute a request
4. Copie o `id` do usuário criado para a variável `user_id` do environment

### 5. Testar Operações com ID

Agora teste:
- **"Get User by ID"** - deve retornar o usuário criado
- **"Get User History"** - deve mostrar o histórico
- **"Update User"** - modifique algum campo e execute
- **"Delete User"** - execute para soft delete

### 6. Testar Aprovações

Se criou usuário com responsáveis, teste:
- **"Get Approvals"** - deve listar aprovações pendentes
- **"Respond to Approval"** - configure `approval_id` no environment e execute (use `approverEmail` e `approve: true/false` no body)

### 7. Testar Graduações

Execute **"Get Graduations"** - deve retornar lista de graduações BJJ baseada na data de nascimento.

### 8. Documentação da API

Acesse a documentação interativa da API:

- **"Swagger UI"** - Interface web interativa para explorar e testar todos os endpoints
- **"OpenAPI JSON"** - Especificação OpenAPI 3.0 em formato JSON

## Headers Necessários

Todas as requests (exceto Login) precisam dos seguintes headers:

- `x-api-key`: Chave API configurada
- `x-tenant-id`: ID do tenant
- `Authorization: Bearer {{firebase_token}}`: Token obtido no login

## Tratamento de Erros

### Erro "API key obrigatória"
- Verifique se a variável `api_key` está configurada corretamente

### Erro "Token Firebase obrigatório"
- Faça login primeiro e configure `firebase_token`

### Erro "Tenant inválido"
- Verifique se `tenant_id` corresponde ao configurado

### Erro 404
- Para operações com ID, certifique-se que o `user_id` existe

## Dicas

- Use o "Runner" do Postman para executar múltiplas requests em sequência
- Configure "Tests" nas requests para automatizar extração de IDs/tokens
- Para testar upload de foto, use uma string base64 válida no campo `photoBase64`
- O emulador usa Firestore local, então dados são resetados ao reiniciar

## Troubleshooting

### Emulador não inicia
```bash
# Pare processos Firebase
pkill -f firebase

# Tente novamente
npm run serve
```

### Functions não carregam
- Verifique se `npm run build` executa sem erros
- Certifique-se que `firebase.json` aponta para a pasta correta

### Erro de CORS
- O emulador Firebase permite CORS automaticamente
- Se testar de outro domínio, pode precisar configurar CORS no Firebase Functions