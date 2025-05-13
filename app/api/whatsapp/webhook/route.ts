import { NextResponse } from 'next/server';

/**
 * Webhook para receber eventos da Evolution API
 * Este endpoint processa os eventos recebidos da Evolution API e os 
 * encaminha para o processamento adequado.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = req.headers.get('apikey') || req.headers.get('x-apikey');
    
    // Verificar autenticação se necessário
    const configuredKey = process.env.EVOLUTION_API_KEY;
    if (configuredKey && apiKey !== configuredKey) {
      return NextResponse.json(
        { success: false, error: 'Chave API inválida' },
        { status: 401 }
      );
    }
    
    // Registrar evento recebido (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('Webhook do WhatsApp recebido:', JSON.stringify(body, null, 2));
    } else {
      // Em produção, registrar apenas o tipo de evento
      console.log(`Webhook do WhatsApp recebido: ${body.event || 'evento desconhecido'}`);
    }
    
    /**
     * Processar diferentes tipos de eventos
     */
    
    // Evento de mensagem recebida
    if (body.event === 'messages.upsert') {
      await processMessage(body);
    }
    
    // Evento de atualização de conexão
    else if (body.event === 'connection.update') {
      await processConnectionUpdate(body);
    }
    
    // Evento de QR Code atualizado
    else if (body.event === 'qrcode.updated') {
      await processQRCodeUpdate(body);
    }
    
    // Evento de atualização de status de mensagem
    else if (body.event === 'messages.update') {
      await processMessageStatusUpdate(body);
    }
    
    // Responde com sucesso
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro no webhook do WhatsApp:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

/**
 * Rota para validação do webhook (usado durante a configuração)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // Parâmetros usados pelo WhatsApp Business API (para compatibilidade)
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Webhook de verificação do WhatsApp Business
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge);
  }
  
  // Resposta padrão para qualquer outra solicitação GET
  return new Response('Webhook do WhatsApp operacional', { status: 200 });
}

/**
 * Processa mensagens recebidas
 */
async function processMessage(data: any) {
  // Ignorar mensagens enviadas pelo próprio bot ou status
  if (data?.data?.key?.fromMe || data?.data?.key?.remoteJid?.endsWith('@broadcast')) {
    return;
  }
  
  try {
    const message = data.data;
    const remoteJid = message.key.remoteJid;
    const sender = remoteJid.split('@')[0];
    const instanceName = data.instance;
    
    // Obter conteúdo da mensagem
    let messageContent = '';
    
    if (message.message?.conversation) {
      messageContent = message.message.conversation;
    } else if (message.message?.imageMessage) {
      messageContent = message.message.imageMessage.caption || 'Imagem';
    } else if (message.message?.videoMessage) {
      messageContent = message.message.videoMessage.caption || 'Vídeo';
    } else if (message.message?.documentMessage) {
      messageContent = message.message.documentMessage.fileName || 'Documento';
    } else if (message.message?.audioMessage) {
      messageContent = 'Áudio';
    } else if (message.message?.stickerMessage) {
      messageContent = 'Sticker';
    } else if (message.message?.contactMessage) {
      messageContent = 'Contato';
    } else if (message.message?.locationMessage) {
      messageContent = 'Localização';
    } else {
      messageContent = 'Mensagem não reconhecida';
    }
    
    // Log da mensagem recebida (apenas desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Mensagem recebida de ${sender}: ${messageContent}`);
    }
    
    // Aqui você pode implementar diferentes fluxos:
    // 1. Direcionar a mensagem para um sistema de atendimento
    // 2. Processar com uma API de IA para respostas automáticas
    // 3. Armazenar em banco de dados para histórico
    // 4. Enviar notificações para um sistema externo
    
    // Por exemplo, para responder automaticamente:
    /*
    import { EvolutionAPIService } from '@/lib/evolution-api-service';
    
    await EvolutionAPIService.sendTextMessage(
      sender,
      `Recebemos sua mensagem: "${messageContent}". 
      Um agente responderá em breve.`,
      { 
        instanceName,
        delayTyping: 2 // Simular digitação por 2 segundos
      }
    );
    */
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
}

/**
 * Processa atualizações de status de conexão
 */
async function processConnectionUpdate(data: any) {
  try {
    const state = data.data.state;
    const instance = data.instance;
    
    console.log(`Status da conexão atualizado para ${state} na instância ${instance}`);
    
    // Aqui você pode implementar lógica específica para cada estado:
    // 1. 'open' - Instância conectada ao WhatsApp
    // 2. 'connecting' - Tentando conectar ao WhatsApp
    // 3. 'close' - Desconectado do WhatsApp
    
    if (state === 'close') {
      // Exemplo: Enviar notificação para sistema de monitoramento
      // ou tentar reconectar automaticamente
    }
    
  } catch (error) {
    console.error('Erro ao processar atualização de conexão:', error);
  }
}

/**
 * Processa atualizações de QR code
 */
async function processQRCodeUpdate(data: any) {
  try {
    console.log(`QR Code atualizado para a instância ${data.instance}`);
    
    // Aqui você pode implementar lógica como:
    // 1. Armazenar o QR code mais recente em banco de dados
    // 2. Enviar notificação para o usuário escanear o novo QR code
    // 3. Exibir no frontend através de WebSockets
    
  } catch (error) {
    console.error('Erro ao processar atualização de QR code:', error);
  }
}

/**
 * Processa atualizações de status de mensagem
 */
async function processMessageStatusUpdate(data: any) {
  try {
    const messageId = data.data.key.id;
    const status = data.data.status;
    const instanceName = data.instance;
    
    console.log(`Status da mensagem ${messageId} atualizado para ${status}`);
    
    // Aqui você pode implementar lógica como:
    // 1. Atualizar status da mensagem em banco de dados
    // 2. Notificar sistemas externos sobre entrega/leitura
    // 3. Registrar estatísticas de entrega
    
  } catch (error) {
    console.error('Erro ao processar atualização de status de mensagem:', error);
  }
}