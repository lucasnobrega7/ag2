import axios from 'axios';

/**
 * Cliente para a Evolution API para integração com WhatsApp
 */
const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.EVOLUTION_API_KEY
  },
  // Aumentar timeout para evitar problemas em operações demoradas
  timeout: 30000
});

/**
 * Interface para status da instância
 */
export interface InstanceStatus {
  success: boolean;
  state: 'open' | 'connecting' | 'close';
  message?: string;
}

/**
 * Interface para resposta do QR Code
 */
export interface QrCodeResponse {
  success: boolean;
  qrcode?: string;
  message?: string;
}

/**
 * Interface para resposta de mensagem
 */
export interface MessageResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  status?: string;
}

/**
 * Criar uma nova instância do WhatsApp
 */
export async function createInstance(instanceName: string, webhookUrl?: string) {
  try {
    console.log('Tentando criar instância:', instanceName);

    // Verificar versão e endpoints disponíveis
    const versionResponse = await evolutionApi.get('/');
    console.log('Versão da API:', versionResponse.data);

    // Tentar criar instância com novo formato
    const response = await evolutionApi.post('/instance/create', {
      instanceName,
      webhook: webhookUrl || process.env.NEXT_PUBLIC_APP_URL + '/api/whatsapp/webhook',
      webhookByEvents: false,
      instanceConfig: {
        integration: "whatsapp"
      },
      events: {
        QRCODE_UPDATED: true,
        MESSAGES_UPSERT: true,
        MESSAGES_UPDATE: true,
        CONNECTION_UPDATE: true
      }
    });

    console.log('Resposta da criação:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar instância:', error?.response?.data || error.message);

    // Tentar com endpoint alternativo se o primeiro falhar
    try {
      const fallbackResponse = await evolutionApi.post('/api/instance/init', {
        instanceName,
        webhook: webhookUrl || process.env.NEXT_PUBLIC_APP_URL + '/api/whatsapp/webhook'
      });
      console.log('Resposta da criação (fallback):', fallbackResponse.data);
      return fallbackResponse.data;
    } catch (fallbackError: any) {
      console.error('Erro no fallback:', fallbackError?.response?.data || fallbackError.message);
      throw error;
    }
  }
}

/**
 * Obter o QR Code para conectar
 */
export async function getQrCode(instanceName: string): Promise<QrCodeResponse> {
  try {
    console.log('Tentando obter QR code para:', instanceName);

    // Tentar endpoint padrão
    try {
      const response = await evolutionApi.get(`/instance/qrcode/${instanceName}?image=true`);
      console.log('QR code obtido com sucesso');
      return response.data;
    } catch (error) {
      console.log('Erro ao obter QR code com endpoint padrão, tentando alternativo');
      // Tentar endpoint alternativo
      const fallbackResponse = await evolutionApi.get(`/api/instance/qrcode/${instanceName}`);

      // Formatação de resposta para manter compatibilidade
      return {
        success: true,
        qrcode: fallbackResponse.data.qrcode || fallbackResponse.data.base64,
        message: "QR code obtido via endpoint alternativo"
      };
    }
  } catch (error: any) {
    console.error('Erro ao obter QR Code:', error?.response?.data || error.message);
    throw error;
  }
}

/**
 * Obter status da conexão
 */
export async function getConnectionStatus(instanceName: string): Promise<InstanceStatus> {
  try {
    const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter status da conexão:', error);
    throw error;
  }
}

/**
 * Enviar mensagem de texto
 */
export async function sendTextMessage(
  instanceName: string, 
  phoneNumber: string, 
  message: string
): Promise<MessageResponse> {
  try {
    // Formatar número do telefone (remover caracteres não numéricos)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    const response = await evolutionApi.post(`/message/text/${instanceName}`, {
      number: formattedNumber,
      options: {
        delay: 1200,
        presence: 'composing'
      },
      textMessage: {
        text: message
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

/**
 * Enviar mensagem com arquivo
 */
export async function sendFileMessage(
  instanceName: string,
  phoneNumber: string,
  fileUrl: string,
  caption?: string,
  fileName?: string
): Promise<MessageResponse> {
  try {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    const response = await evolutionApi.post(`/message/media/${instanceName}`, {
      number: formattedNumber,
      options: {
        delay: 1200,
        presence: 'composing'
      },
      mediaMessage: {
        mediatype: 'document',
        media: fileUrl,
        caption: caption || '',
        fileName: fileName || 'document'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem com arquivo:', error);
    throw error;
  }
}

/**
 * Desconectar instância
 */
export async function disconnectInstance(instanceName: string) {
  try {
    const response = await evolutionApi.delete(`/instance/logout/${instanceName}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao desconectar instância:', error);
    throw error;
  }
}

/**
 * Listar todas as instâncias
 */
export async function listInstances() {
  try {
    const response = await evolutionApi.get('/instance/fetchInstances');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar instâncias:', error);
    throw error;
  }
}

export default evolutionApi;