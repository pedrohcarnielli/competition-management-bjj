#!/bin/bash

set -e

echo "================================"
echo "Deploy API Local/Production"
echo "================================"

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: Execute este script a partir da raiz do projeto"
  exit 1
fi

# Lê o argumento de ambiente (padrão: local)
ENVIRONMENT=${1:-local}

echo "📝 Ambiente selecionado: $ENVIRONMENT"

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando TypeScript..."
npm run build

case "$ENVIRONMENT" in
  local)
    echo "🌐 Iniciando servidor local na porta 3000..."
    npm run serve
    ;;
  
  serve:debug)
    echo "🐛 Iniciando servidor com debug na porta 3000..."
    npm run serve:debug
    ;;
  
  production)
    echo "🚀 Preparando para produção..."
    echo ""
    echo "⚠️  Nota: Para deploy em produção, use:"
    echo "   - Firebase Functions: ./scripts/deploy-functions.sh"
    echo "   - Plataformas cloud (Azure, Heroku, etc): configure manualmente"
    exit 1
    ;;
  
  *)
    echo "❌ Ambiente desconhecido: $ENVIRONMENT"
    echo ""
    echo "Opções válidas:"
    echo "  ./scripts/deploy-api.sh local      # Servidor local"
    echo "  ./scripts/deploy-api.sh serve:debug # Servidor com debug"
    echo "  ./scripts/deploy-api.sh production  # Info de produção"
    exit 1
    ;;
esac
