#!/bin/bash

# Script para fazer deploy direto no Railway
# Mais simples que o railway-setup.sh para deploy rápido

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== PREPARANDO DEPLOY PARA RAILWAY ===${NC}"

# Verificar se o Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI não está instalado. Instalando...${NC}"
    npm install -g @railway/cli
fi

# Verificar login
LOGGED_IN=$(railway whoami 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}É necessário fazer login no Railway.${NC}"
    railway login
fi

# Verificar arquivos de fonte
echo -e "${YELLOW}Verificando arquivos de fontes...${NC}"
npm run fonts:check

# Verificar compilação CSS
echo -e "${YELLOW}Atualizando CSS processado...${NC}"
npm run css

# Verificar se há alterações não commitadas
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}⚠️ Existem alterações não commitadas no repositório.${NC}"
    echo -e "${YELLOW}Recomendamos fazer commit dessas alterações antes do deploy.${NC}"
    git status --short

    read -p "Deseja prosseguir com o deploy mesmo assim? (s/n): " PROCEED
    if [[ $PROCEED != "s" && $PROCEED != "S" ]]; then
        echo -e "${YELLOW}Deploy cancelado. Faça commit das suas alterações e tente novamente.${NC}"
        exit 0
    fi
fi

# Exibe as informações sobre o projeto atual
echo -e "${YELLOW}Informações do projeto Railway atual:${NC}"
railway status

# Confirmar deploy
read -p "Deseja prosseguir com o deploy no Railway? (s/n): " CONFIRM
if [[ $CONFIRM != "s" && $CONFIRM != "S" ]]; then
    echo -e "${YELLOW}Deploy cancelado.${NC}"
    exit 0
fi

# Deploy para o Railway
echo -e "${GREEN}Iniciando deploy no Railway...${NC}"
railway up

echo -e "${GREEN}=== DEPLOY INICIADO! ===${NC}"
echo -e "Após a conclusão, o site estará disponível no domínio fornecido pelo Railway."
echo -e "Verifique o status do deploy com 'railway status'"
echo -e "Para visualizar os logs em tempo real: railway logs"