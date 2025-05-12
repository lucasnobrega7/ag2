#!/bin/bash

# Script para deploy no Railway usando token via variável de ambiente
# Usar: RAILWAY_TOKEN=seu_token_aqui ./scripts/railway-token-deploy.sh

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== DEPLOY PARA RAILWAY COM TOKEN ===${NC}"

# Verificar se o token foi fornecido
if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${RED}Erro: RAILWAY_TOKEN não definido.${NC}"
    echo -e "Execute com: RAILWAY_TOKEN=seu_token_aqui $0"
    exit 1
fi

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI não está instalado. Instalando...${NC}"
    npm install -g @railway/cli
fi

# Verificar status para confirmar autenticação
echo -e "${YELLOW}Verificando autenticação no Railway...${NC}"
railway status

if [ $? -ne 0 ]; then
    echo -e "${RED}Falha na autenticação. Verifique seu token.${NC}"
    exit 1
fi

# Executar o deploy
echo -e "${GREEN}Autenticação bem-sucedida. Iniciando o deploy...${NC}"
./scripts/prepare-railway-deploy.sh --s

echo -e "${GREEN}=== PROCESSO FINALIZADO ===${NC}"