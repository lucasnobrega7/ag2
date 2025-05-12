#!/bin/bash

# Script para deploy direto no Railway usando curl
# Uso: RAILWAY_TOKEN=seu_token ./railway-deploy-curl.sh

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== INICIANDO DEPLOY PARA RAILWAY USANDO API DIRETA ===${NC}"

# Verificar se o token foi fornecido
if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${RED}Erro: RAILWAY_TOKEN não definido.${NC}"
    echo -e "Execute com: RAILWAY_TOKEN=seu_token $0"
    exit 1
fi

# Informações do projeto
PROJECT_ID=${PROJECT_ID:-"agentes-conversao"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
SERVICE_ID=${SERVICE_ID:-"agentes-conversao"}

# Preparar para o deploy
echo -e "${YELLOW}Verificando recursos críticos para produção...${NC}"
node scripts/production-check.js || exit 1

# Gerar CSS
echo -e "${YELLOW}Gerando CSS...${NC}"
npx tailwindcss -i ./styles/globals.css -o ./styles/output.css

# Build do projeto
echo -e "${YELLOW}Executando build...${NC}"
NEXT_TELEMETRY_DISABLED=1 npx next build

echo -e "${GREEN}Build concluído com sucesso.${NC}"

# Deploy usando o CLI do Railway com token
echo -e "${YELLOW}Iniciando deploy no Railway...${NC}"
RAILWAY_TOKEN="$RAILWAY_TOKEN" railway up

echo -e "${GREEN}Comando de deploy executado com sucesso!${NC}"
echo -e "${YELLOW}Verifique o status do deploy em:${NC}"
echo -e "https://railway.app/project/$PROJECT_ID/services"

echo -e "${GREEN}=== PROCESSO FINALIZADO ===${NC}"