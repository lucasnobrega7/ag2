# Deploy no Railway

Este guia explica como fazer o deploy do site Agentes de Conversão no Railway.

## Pré-requisitos

1. Conta no Railway (https://railway.app)
2. Railway CLI instalado (npm install -g @railway/cli)
3. Node.js 18 ou superior
4. Para converter fontes: fonttools (`pip install fonttools brotli`)

## Configurações Atualizadas para o Deploy

### Arquivos de Configuração

O projeto já está configurado com os arquivos necessários para o deploy no Railway:

- `railway.json` - Configuração do Railway (builder, runtime, etc.)
- `Dockerfile` - Instruções para build do container Docker
- `next.config.js` - Configurações do Next.js para produção (output: standalone)
- `.env.production` - Variáveis de ambiente para produção
- `convert-fonts.js` - Script para converter fontes OTF para WOFF2

### Scripts NPM para Deploy

Os seguintes scripts estão disponíveis:

- `npm run deploy` - Executa o deploy para o Railway (rápido)
- `npm run setup` - Configuração inicial e deploy para o Railway (interativo)
- `npm run fonts:convert` - Converte fontes OTF para WOFF2
- `npm run fonts:check` - Verifica se as fontes necessárias estão presentes
- `npm run css` - Gera CSS processado pelo Tailwind

## Preparando para o Deploy

### 1. Converter as Fontes

Para garantir que as fontes sejam exibidas corretamente:

```bash
# Instale a ferramenta de conversão (necessário apenas uma vez)
pip install fonttools brotli

# Execute o script de conversão
npm run fonts:check
npm run fonts:convert
```

### 2. Processar o CSS

O Tailwind CSS precisa ser processado antes do deploy:

```bash
npm run css
```

Isso será feito automaticamente durante o build, mas é recomendado verificar localmente.

## Métodos de Deploy

### 1. Deploy Rápido (Recomendado)

Para fazer o deploy rápido para um projeto já configurado:

```bash
npm run deploy
```

Este script verifica fontes, gera CSS e faz o deploy automaticamente.

### 2. Configuração Inicial e Deploy

Para novos projetos ou configuração completa:

```bash
npm run setup
```

Este script permite selecionar ou criar um projeto no Railway.

### 3. Deploy Manual (CLI)

Se preferir fazer o deploy manualmente:

```bash
# Fazer login no Railway
railway login

# Criar novo projeto ou vincular a um existente
railway init
# OU
railway link -p seu-project-id

# Configurar variáveis de ambiente
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_SITE_URL=https://agentesdeconversao.com.br

# Fazer o deploy
railway up
```

## Verificações Pós-Deploy

### 1. URL do Site

Após o deploy, acesse a URL fornecida pelo Railway para verificar se o site está funcionando corretamente.

```bash
# Obter a URL do site
railway status
```

### 2. Verificação de Fontes

Certifique-se de que as fontes estão sendo carregadas corretamente abrindo o DevTools do navegador e verificando a aba "Network".

### 3. Logs e Monitoramento

Verifique os logs para identificar possíveis problemas:

```bash
railway logs
```

## Recursos Adicionais

- **Dashboard**: Acesse o [dashboard do Railway](https://railway.app/dashboard) para gerenciar seu projeto
- **Configurações de Domínio**: Configure domínios personalizados em "Settings > Domains"
- **Variáveis de Ambiente**: Adicione ou edite variáveis em "Variables"
- **Monitoramento**: Verifique métricas de desempenho em "Metrics"

## Solução de Problemas

- **Fontes não carregam**: Verifique se as fontes WOFF2 foram geradas e se os caminhos no CSS estão corretos
- **Falha no build**: Verifique os logs de build para identificar o problema
- **CSS não atualizado**: Forçe a atualização do cache no navegador (Ctrl+F5)
- **Erro 503**: Verifique se o serviço está rodando e se o health check está passando

Para mais informações, consulte a [documentação do Railway](https://docs.railway.app/).