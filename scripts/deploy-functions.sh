#!/bin/bash

set -e

echo "================================"
echo "Deploy Firebase"
echo "================================"

# Parâmetro de deploy (padrão: functions)
DEPLOY_TARGET=${1:-functions}

# Valida o alvo de deploy
if [ "$DEPLOY_TARGET" != "functions" ] && [ "$DEPLOY_TARGET" != "all" ]; then
  echo "❌ Alvo de deploy inválido: $DEPLOY_TARGET"
  echo ""
  echo "Opções válidas:"
  echo "  ./scripts/deploy-functions.sh          # Deploy apenas das functions"
  echo "  ./scripts/deploy-functions.sh functions # Deploy apenas das functions"
  echo "  ./scripts/deploy-functions.sh all      # Deploy de functions, rules e indexes"
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
fi

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "================================"

