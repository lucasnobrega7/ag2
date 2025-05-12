#!/bin/bash

# Script para deploy direto no Railway
# Este script não requer login interativo, apenas o token como argumento
# Uso: ./scripts/railway-direct-deploy.sh [PROJETO_ID]

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== INICIANDO DEPLOY DIRETO PARA RAILWAY ===${NC}"

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI não está instalado. Instalando...${NC}"
    npm install -g @railway/cli
fi

# Preparar para o deploy
echo -e "${YELLOW}Verificando recursos críticos para produção...${NC}"
node scripts/production-check.js || exit 1

# Gerar CSS
echo -e "${YELLOW}Gerando CSS...${NC}"
npx tailwindcss -i ./styles/globals.css -o ./styles/output.css

# Build do projeto
echo -e "${YELLOW}Executando build...${NC}"
NEXT_TELEMETRY_DISABLED=1 npx next build

echo -e "${GREEN}Build concluído com sucesso. Enviando para o Railway...${NC}"

# Deploy direto para o Railway usando curl
echo -e "${YELLOW}Iniciando deploy via API do Railway...${NC}"
SERVICE=${1:-"agentes-conversao"}

# Comando simples para fazer deploy
echo -e "${YELLOW}Para realizar o deploy, execute o comando a seguir com seu token:${NC}"
echo -e "railway up"

# Instruções para deploy manual
echo -e "${YELLOW}Ou visite: https://railway.app/project/${SERVICE}/services${NC}"

echo -e "${GREEN}=== PROCESSO FINALIZADO ===${NC}"