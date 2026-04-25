#!/bin/bash

set -e

echo "================================"
echo "Deploy Firebase"
echo "================================"

# Parâmetro de deploy (padrão: functions)
DEPLOY_TARGET=${1:-functions}

# Valida o alvo de deploy
if [ "$DEPLOY_TARGET" != "functions" ] && [ "$DEPLOY_TARGET" != "all" ] && \
   [ "$DEPLOY_TARGET" != "user" ] && [ "$DEPLOY_TARGET" != "auth" ] && \
   [ "$DEPLOY_TARGET" != "approval" ] && [ "$DEPLOY_TARGET" != "graduation" ] && \
   [ "$DEPLOY_TARGET" != "role" ] && [ "$DEPLOY_TARGET" != "documentation" ] && \
   [ "$DEPLOY_TARGET" != "email" ]; then
  echo "❌ Alvo de deploy inválido: $DEPLOY_TARGET"
  echo ""
  echo "Opções válidas:"
  echo "  ./scripts/deploy-functions.sh                # Deploy apenas das functions (padrão)"
  echo "  ./scripts/deploy-functions.sh functions      # Deploy apenas das functions"
  echo "  ./scripts/deploy-functions.sh all            # Deploy de functions, rules e indexes"
  echo ""
  echo "Deploy individual de functions:"
  echo "  ./scripts/deploy-functions.sh user           # Deploy apenas user functions"
  echo "  ./scripts/deploy-functions.sh auth           # Deploy apenas auth functions"
  echo "  ./scripts/deploy-functions.sh approval       # Deploy apenas approval functions"
  echo "  ./scripts/deploy-functions.sh graduation     # Deploy apenas graduation functions"
  echo "  ./scripts/deploy-functions.sh role           # Deploy apenas role functions"
  echo "  ./scripts/deploy-functions.sh documentation  # Deploy apenas documentation functions"
  echo "  ./scripts/deploy-functions.sh email          # Deploy apenas email functions"
  exit 1
fi

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script a partir da raiz do projeto"
  exit 1
fi

# Verifica se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI não está instalado"
  echo "Instale com: npm install -g firebase-tools"
  exit 1
fi

# Verifica se está autenticado no Firebase
if ! firebase projects:list &> /dev/null; then
  echo "⚠️  Não autenticado. Fazendo login..."
  firebase login
fi

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando TypeScript..."
npm run build

if [ "$DEPLOY_TARGET" = "functions" ]; then
  echo "🚀 Fazendo deploy das functions..."
  firebase deploy --only functions
  
elif [ "$DEPLOY_TARGET" = "all" ]; then
  echo "🚀 Fazendo deploy completo (functions, firestore:rules, firestore:indexes)..."
  firebase deploy

else
  # Deploy individual de uma função específica
  FUNCTION_NAME=""
  
  case "$DEPLOY_TARGET" in
    user)
      FUNCTION_NAME="user"
      ;;
    auth)
      FUNCTION_NAME="auth"
      ;;
    approval)
      FUNCTION_NAME="approval"
      ;;
    graduation)
      FUNCTION_NAME="graduation"
      ;;
    role)
      FUNCTION_NAME="role"
      ;;
    documentation)
      FUNCTION_NAME="documentation"
      ;;
    email)
      FUNCTION_NAME="email"
      ;;
  esac
  
  echo "🚀 Fazendo deploy das $DEPLOY_TARGET functions..."
  # Deploy individual de funções específicas (substituir getUsers, login, etc. conforme necessário)
  firebase deploy --only functions:getUsers,functions:getUserById,functions:getUserHistory,functions:createUserFunction,functions:updateUserFunction,functions:deleteUserFunction,functions:login,functions:getApprovalsFunction,functions:respondApprovalFunction,functions:getGraduations,functions:getRoles,functions:getUsersByRole,functions:healthEmail,functions:docs,functions:swaggerJson,functions:dispatchEmail
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "================================"


