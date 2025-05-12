#!/bin/bash

# Script para login no Railway via CLI sem abrir o navegador
# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== REALIZANDO LOGIN NO RAILWAY VIA CLI ===${NC}"

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI não está instalado. Instalando...${NC}"
    npm install -g @railway/cli
fi

# Informações de login via CLI
echo -e "${YELLOW}Para fazer login no Railway via CLI, você pode usar um dos seguintes métodos:${NC}"
echo -e "1. ${GREEN}Login com token:${NC}"
echo -e "   a) Acesse https://railway.app/account/tokens"
echo -e "   b) Gere um novo token"
echo -e "   c) Execute: railway login --browserless"
echo -e "   d) Cole o token quando solicitado"
echo ""
echo -e "2. ${GREEN}Login sem navegador com API Key:${NC}"
echo -e "   Execute: RAILWAY_TOKEN=seu_token railway status"
echo ""

# Tentar login com browserless mode
read -p "Deseja tentar o login sem navegador agora? (s/n): " BROWSER_LOGIN
if [[ $BROWSER_LOGIN == "s" || $BROWSER_LOGIN == "S" ]]; then
    railway login --browserless
else
    echo -e "${YELLOW}Login cancelado. Execute 'railway login' manualmente para autenticar com o navegador.${NC}"
fi

echo -e "${GREEN}=== PROCESSO FINALIZADO ===${NC}"