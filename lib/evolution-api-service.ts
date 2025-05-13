/**
 * Serviço para integração com Evolution API (WhatsApp API).
 * 
 * Este serviço implementa a comunicação com a Evolution API para envio de
 * mensagens via WhatsApp e gerenciamento da conexão.
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { evolutionWebSocket } from './websocket';

// Tipos
export interface MessageResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  status?: string;
  error?: string;
  error_detail?: any;
}

export interface ConnectionStatus {
  success: boolean;
  connected?: boolean;
  state?: 'open' | 'connecting' | 'close';
  message?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrcode?: string;
  message?: string;
  expiresAt?: number;
}

export interface ContactResponse {
  success: boolean;
  contacts?: any[];
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  chats?: any[];
  error?: string;
}

export interface MessageHistoryResponse {
  success: boolean;
  messages?: any[];
  error?: string;
}

export interface TemplateMessageComponent {
  type: 'header' | 'body' | 'button';
  parameters?: any[];
}

export class EvolutionAPIService {
  /**
   * Obtém as configurações da Evolution API.
   */
  private static getConfig(): Record<string, string | undefined> {
    const instanceId = process.env.EVOLUTION_INSTANCE_ID || 'default';
    const apiKey = process.env.EVOLUTION_API_KEY;
    const baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';

    // Mascarar apiKey para log (mostrar apenas os primeiros 5 caracteres)
    const maskedKey = apiKey ? `${apiKey.slice(0, 5)}***` : apiKey;
    console.debug(`EvolutionAPIService - Config: instanceId=${instanceId}, apiKey=${maskedKey}, baseUrl=${baseUrl}`);

    return {
      instanceId,
      apiKey,
      baseUrl
    };
  }

  /**
   * Cria os cabeçalhos padrão para as requisições.
   */
  private static getHeaders(): Record<string, string> {
    const config = this.getConfig();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['apikey'] = config.apiKey;
    }

    return headers;
  }

  /**
   * Faz uma requisição para a API da Evolution.
   */
  private static async makeRequest<T>(
    method: string, 
    endpoint: string, 
    data?: any, 
    params?: Record<string, string | number | boolean>,
    files?: any
  ): Promise<T> {
    const config = this.getConfig();
    
    if (!config.baseUrl || !config.apiKey) {
      return {
        success: false,
        error: "Configurações da Evolution API incompletas. Verifique EVOLUTION_API_URL e EVOLUTION_API_KEY."
      } as unknown as T;
    }

    // Construir URL completa
    const url = `${config.baseUrl}/${endpoint}`;
    
    const headers = this.getHeaders();
    const axiosConfig: AxiosRequestConfig = { headers, params };
    
    try {
      let response: AxiosResponse<any>;
      
      if (method === 'GET') {
        response = await axios.get(url, axiosConfig);
      } else if (method === 'POST') {
        if (files) {
          // Se temos arquivos, ajustar cabeçalhos e enviar com FormData
          const formData = new FormData();
          
          // Adicionar arquivos ao FormData
          Object.keys(files).forEach(key => {
            formData.append(key, files[key]);
          });
          
          // Adicionar dados ao FormData se houver
          if (data) {
            Object.keys(data).forEach(key => {
              formData.append(key, data[key]);
            });
          }
          
          // Remover Content-Type para o axios definir automaticamente com boundary
          const fileHeaders = { ...headers };
          delete fileHeaders['Content-Type'];
          
          response = await axios.post(url, formData, { 
            ...axiosConfig, 
            headers: fileHeaders 
          });
        } else {
          response = await axios.post(url, data, axiosConfig);
        }
      } else if (method === 'PUT') {
        response = await axios.put(url, data, axiosConfig);
      } else if (method === 'DELETE') {
        response = await axios.delete(url, { ...axiosConfig, data });
      } else {
        return {
          success: false,
          error: `Método HTTP não suportado: ${method}`
        } as unknown as T;
      }
      
      // Adicionar flag de sucesso ao resultado
      const result = { ...response.data, success: true };
      console.debug(`Resposta Evolution API: ${JSON.stringify(result)}`);
      return result as T;
      
    } catch (error: any) {
      console.error(`Erro ao fazer requisição para Evolution API: ${error.message}`);
      
      const errorResponse = {
        success: false,
        error: error.message
      };
      
      // Tentar extrair mais informações se houver resposta
      if (error.response) {
        try {
          errorResponse.error_detail = error.response.data;
        } catch {
          errorResponse.status_code = error.response.status;
          errorResponse.raw_response = error.response.data;
        }
      }
      
      return errorResponse as unknown as T;
    }
  }

  /**
   * Verifica se a conexão com a Evolution API está funcionando.
   */
  static async checkConnection(instanceName?: string): Promise<ConnectionStatus> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      // Inicializar WebSocket para monitoramento em tempo real (opcional)
      await evolutionWebSocket.initialize();
      
      const result = await this.makeRequest<ConnectionStatus>(
        'GET', 
        `instance/connectionState/${instance}`
      );
      
      if (result.success) {
        if (result.state === 'open') {
          return {
            success: true,
            connected: true,
            state: 'open',
            message: "Conectado ao WhatsApp"
          };
        } else {
          return {
            success: true,
            connected: false,
            state: result.state,
            message: result.state === 'connecting' 
              ? "Conectando ao WhatsApp..." 
              : "Não conectado ao WhatsApp. Escaneie o QR Code para conectar."
          };
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao verificar conexão:', error);
      return {
        success: false,
        connected: false,
        message: error.message || 'Erro ao verificar conexão'
      };
    }
  }

  /**
   * Obtém o QR Code para conexão com o WhatsApp.
   */
  static async getQRCode(instanceName?: string): Promise<QRCodeResponse> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      // Inicializar WebSocket para monitoramento em tempo real
      await evolutionWebSocket.initialize();
      
      // Tentar obter QR code - tentando múltiplos formatos de endpoint para compatibilidade
      let result: QRCodeResponse;
      
      try {
        // Endpoint mais comum
        result = await this.makeRequest<QRCodeResponse>(
          'GET', 
          `instance/qrcode/${instance}?image=true`
        );
        
        if (result.success && result.qrcode) {
          // Adicionar tempo de expiração (2 minutos)
          const expiresAt = Date.now() + 2 * 60 * 1000;
          return {
            ...result,
            expiresAt
          };
        }
      } catch (e) {
        console.log('Tentando endpoint alternativo para QR Code...');
      }
      
      // Tentar formato alternativo de endpoint (compatibilidade)
      result = await this.makeRequest<QRCodeResponse>(
        'GET', 
        `api/instance/qrcode/${instance}`
      );
      
      // Adicionar tempo de expiração (2 minutos)
      const expiresAt = Date.now() + 2 * 60 * 1000;
      
      return {
        success: true,
        qrcode: result.qrcode || (result as any).base64,
        expiresAt
      };
    } catch (error: any) {
      console.error('Erro ao obter QR code:', error);
      return {
        success: false,
        message: error.message || 'Erro ao obter QR code'
      };
    }
  }

  /**
   * Cria uma nova instância do WhatsApp ou reinicia uma existente.
   */
  static async createOrRestartInstance(
    instanceName?: string, 
    webhookUrl?: string,
    useProxy = false
  ): Promise<{ success: boolean; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const data: Record<string, any> = {
        instanceName: instance,
        webhook: webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`,
        webhookByEvents: true,
        events: {
          QRCODE_UPDATED: true,
          MESSAGES_UPSERT: true,
          MESSAGES_UPDATE: true,
          CONNECTION_UPDATE: true
        }
      };
      
      // Opções adicionais para maior proteção
      if (useProxy) {
        data.useProxy = true;
        data.instanceConfig = {
          proxyOptions: {
            enabled: true,
            type: 'webshare', // Sistema de proxy rotativo
            autoRotate: true,
            interval: 600 // Rotação a cada 10 minutos
          },
          reconnectOptions: {
            maxRetries: 5,
            delayMs: 3000
          },
          markMessagesRead: true,
          disableWebhook: false
        };
      }
      
      const result = await this.makeRequest<{ success: boolean; message?: string }>(
        'POST', 
        'instance/create', 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar instância'
      };
    }
  }

  /**
   * Desconecta a instância do WhatsApp.
   */
  static async disconnect(instanceName?: string): Promise<{ success: boolean; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const result = await this.makeRequest<{ success: boolean; message?: string }>(
        'DELETE', 
        `instance/logout/${instance}`
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      return {
        success: false,
        message: error.message || 'Erro ao desconectar'
      };
    }
  }

  /**
   * Deleta uma instância do WhatsApp.
   */
  static async deleteInstance(instanceName?: string): Promise<{ success: boolean; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const result = await this.makeRequest<{ success: boolean; message?: string }>(
        'DELETE', 
        `instance/delete/${instance}`
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao deletar instância:', error);
      return {
        success: false,
        message: error.message || 'Erro ao deletar instância'
      };
    }
  }

  /**
   * Envia uma mensagem de texto via WhatsApp.
   */
  static async sendTextMessage(
    phone: string, 
    message: string, 
    options?: {
      instanceName?: string;
      delayMessage?: number;
      delayTyping?: number;
      quotedMessageId?: string;
    }
  ): Promise<MessageResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data: Record<string, any> = {
        number: formattedPhone,
        options: {},
        textMessage: {
          text: message
        }
      };
      
      // Adicionar parâmetros opcionais
      if (options?.delayMessage) {
        data.options.delay = Math.max(1, Math.min(15, options.delayMessage)) * 1000; // ms
      }
      
      if (options?.delayTyping) {
        data.options.presence = 'composing';
        data.options.delay = Math.max(1, Math.min(15, options.delayTyping)) * 1000; // ms
      }
      
      if (options?.quotedMessageId) {
        data.options.quoted = { id: options.quotedMessageId };
      }
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/text/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem de texto:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar mensagem de texto'
      };
    }
  }

  /**
   * Envia uma imagem via WhatsApp.
   */
  static async sendImage(
    phone: string, 
    imageUrl: string, 
    options?: {
      instanceName?: string;
      caption?: string;
      quotedMessageId?: string;
      delayMessage?: number;
      viewOnce?: boolean;
    }
  ): Promise<MessageResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data: Record<string, any> = {
        number: formattedPhone,
        options: {},
        mediaMessage: {
          mediatype: 'image',
          media: imageUrl
        }
      };
      
      // Adicionar parâmetros opcionais
      if (options?.caption) {
        data.mediaMessage.caption = options.caption;
      }
      
      if (options?.delayMessage) {
        data.options.delay = Math.max(1, Math.min(15, options.delayMessage)) * 1000; // ms
      }
      
      if (options?.quotedMessageId) {
        data.options.quoted = { id: options.quotedMessageId };
      }
      
      if (options?.viewOnce) {
        data.options.viewOnce = options.viewOnce;
      }
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/media/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar imagem:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar imagem'
      };
    }
  }

  /**
   * Envia um documento via WhatsApp.
   */
  static async sendDocument(
    phone: string, 
    documentUrl: string, 
    options?: {
      instanceName?: string;
      fileName?: string;
      caption?: string;
      quotedMessageId?: string;
      delayMessage?: number;
    }
  ): Promise<MessageResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data: Record<string, any> = {
        number: formattedPhone,
        options: {},
        mediaMessage: {
          mediatype: 'document',
          media: documentUrl
        }
      };
      
      // Adicionar parâmetros opcionais
      if (options?.fileName) {
        data.mediaMessage.fileName = options.fileName;
      } else {
        // Extrair nome de arquivo da URL se não fornecido
        try {
          const url = new URL(documentUrl);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          if (fileName) {
            data.mediaMessage.fileName = fileName;
          } else {
            data.mediaMessage.fileName = 'document';
          }
        } catch {
          data.mediaMessage.fileName = 'document';
        }
      }
      
      if (options?.caption) {
        data.mediaMessage.caption = options.caption;
      }
      
      if (options?.delayMessage) {
        data.options.delay = Math.max(1, Math.min(15, options.delayMessage)) * 1000; // ms
      }
      
      if (options?.quotedMessageId) {
        data.options.quoted = { id: options.quotedMessageId };
      }
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/media/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar documento'
      };
    }
  }

  /**
   * Envia um áudio via WhatsApp.
   */
  static async sendAudio(
    phone: string, 
    audioUrl: string, 
    options?: {
      instanceName?: string;
      delayMessage?: number;
      delayTyping?: number;
      viewOnce?: boolean;
      ptt?: boolean; // Push to talk (voice message)
    }
  ): Promise<MessageResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data: Record<string, any> = {
        number: formattedPhone,
        options: {},
        mediaMessage: {
          mediatype: 'audio',
          media: audioUrl,
          // Voice message vs. audio file
          ptt: options?.ptt !== undefined ? options.ptt : true
        }
      };
      
      // Adicionar parâmetros opcionais
      if (options?.delayMessage) {
        data.options.delay = Math.max(1, Math.min(15, options.delayMessage)) * 1000; // ms
      }
      
      if (options?.delayTyping) {
        data.options.presence = 'recording';
        data.options.delay = Math.max(1, Math.min(15, options.delayTyping)) * 1000; // ms
      }
      
      if (options?.viewOnce) {
        data.options.viewOnce = options.viewOnce;
      }
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/media/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar áudio:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar áudio'
      };
    }
  }

  /**
   * Envia um vídeo via WhatsApp.
   */
  static async sendVideo(
    phone: string, 
    videoUrl: string, 
    options?: {
      instanceName?: string;
      caption?: string;
      quotedMessageId?: string;
      delayMessage?: number;
      viewOnce?: boolean;
    }
  ): Promise<MessageResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data: Record<string, any> = {
        number: formattedPhone,
        options: {},
        mediaMessage: {
          mediatype: 'video',
          media: videoUrl
        }
      };
      
      // Adicionar parâmetros opcionais
      if (options?.caption) {
        data.mediaMessage.caption = options.caption;
      }
      
      if (options?.delayMessage) {
        data.options.delay = Math.max(1, Math.min(15, options.delayMessage)) * 1000; // ms
      }
      
      if (options?.quotedMessageId) {
        data.options.quoted = { id: options.quotedMessageId };
      }
      
      if (options?.viewOnce) {
        data.options.viewOnce = options.viewOnce;
      }
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/media/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar vídeo:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar vídeo'
      };
    }
  }

  /**
   * Envia um link com preview via WhatsApp.
   */
  static async sendLink(
    phone: string, 
    url: string, 
    options?: {
      instanceName?: string;
      title?: string;
      description?: string;
      thumbnailUrl?: string;
    }
  ): Promise<MessageResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data: Record<string, any> = {
        number: formattedPhone,
        url
      };
      
      // Adicionar parâmetros opcionais
      if (options?.title) {
        data.title = options.title;
      }
      
      if (options?.description) {
        data.description = options.description;
      }
      
      if (options?.thumbnailUrl) {
        data.image = options.thumbnailUrl;
      }
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/link/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar link:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar link'
      };
    }
  }

  /**
   * Envia um contato via WhatsApp.
   */
  static async sendContact(
    phone: string, 
    contactName: string, 
    contactPhone: string,
    instanceName?: string
  ): Promise<MessageResponse> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar números do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      const formattedContactPhone = contactPhone.replace(/\D/g, '');
      
      const data = {
        number: formattedPhone,
        contact: {
          name: contactName,
          number: formattedContactPhone
        }
      };
      
      const result = await this.makeRequest<MessageResponse>(
        'POST', 
        `message/contact/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao enviar contato:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar contato'
      };
    }
  }

  /**
   * Obtém a lista de contatos.
   */
  static async getContacts(instanceName?: string): Promise<ContactResponse> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const result = await this.makeRequest<ContactResponse>(
        'GET', 
        `contact/get-contacts/${instance}`
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao obter contatos:', error);
      return {
        success: false,
        error: error.message || 'Erro ao obter contatos'
      };
    }
  }

  /**
   * Obtém a lista de conversas (chats).
   */
  static async getChats(instanceName?: string): Promise<ChatResponse> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const result = await this.makeRequest<ChatResponse>(
        'GET', 
        `chat/fetch-chats/${instance}`
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao obter conversas:', error);
      return {
        success: false,
        error: error.message || 'Erro ao obter conversas'
      };
    }
  }

  /**
   * Obtém mensagens trocadas com um número específico.
   */
  static async getMessagesByPhone(
    phone: string, 
    options?: {
      instanceName?: string;
      count?: number;
    }
  ): Promise<MessageHistoryResponse> {
    const instance = options?.instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      // Parâmetros de consulta
      const params: Record<string, string | number> = {
        phone: formattedPhone
      };
      
      if (options?.count) {
        params.count = options.count;
      }
      
      const result = await this.makeRequest<MessageHistoryResponse>(
        'GET', 
        `message/fetch-messages/${instance}`, 
        undefined,
        params
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao obter mensagens:', error);
      return {
        success: false,
        error: error.message || 'Erro ao obter mensagens'
      };
    }
  }

  /**
   * Marca todas as mensagens de um contato como lidas.
   */
  static async markAsRead(
    phone: string, 
    instanceName?: string
  ): Promise<{ success: boolean; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      const data = {
        phone: formattedPhone
      };
      
      const result = await this.makeRequest<{ success: boolean; message?: string }>(
        'POST', 
        `message/mark-read/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao marcar como lido:', error);
      return {
        success: false,
        message: error.message || 'Erro ao marcar como lido'
      };
    }
  }

  /**
   * Verifica se um número está registrado no WhatsApp.
   */
  static async isRegisteredOnWhatsApp(
    phone: string, 
    instanceName?: string
  ): Promise<{ success: boolean; exists?: boolean; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      // Formatar número do telefone (remover caracteres não numéricos)
      const formattedPhone = phone.replace(/\D/g, '');
      
      // Parâmetros de consulta
      const params = {
        phone: formattedPhone
      };
      
      const result = await this.makeRequest<{ success: boolean; exists?: boolean; message?: string }>(
        'GET', 
        `contact/check-exists/${instance}`, 
        undefined,
        params
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao verificar número:', error);
      return {
        success: false,
        message: error.message || 'Erro ao verificar número'
      };
    }
  }

  /**
   * Configura um webhook para receber eventos.
   */
  static async setWebhook(
    webhookUrl: string, 
    instanceName?: string
  ): Promise<{ success: boolean; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const data = {
        instanceName: instance,
        webhook: webhookUrl,
        webhookByEvents: true,
        events: {
          QRCODE_UPDATED: true,
          MESSAGES_UPSERT: true,
          MESSAGES_UPDATE: true,
          CONNECTION_UPDATE: true
        }
      };
      
      const result = await this.makeRequest<{ success: boolean; message?: string }>(
        'POST', 
        `webhook/set/${instance}`, 
        data
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao configurar webhook:', error);
      return {
        success: false,
        message: error.message || 'Erro ao configurar webhook'
      };
    }
  }

  /**
   * Faz upload de um arquivo para o serviço.
   */
  static async uploadMedia(
    file: File, 
    mediaType: 'image' | 'document' | 'audio' | 'video' = 'image',
    instanceName?: string
  ): Promise<{ success: boolean; url?: string; message?: string }> {
    const instance = instanceName || this.getConfig().instanceId;
    
    try {
      const files = {
        file: file
      };
      
      const data = {
        mediaType
      };
      
      const result = await this.makeRequest<{ success: boolean; url?: string; message?: string }>(
        'POST', 
        `media/upload/${instance}`, 
        data,
        undefined,
        files
      );
      
      return result;
    } catch (error: any) {
      console.error('Erro ao fazer upload de arquivo:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer upload de arquivo'
      };
    }
  }
}

export default EvolutionAPIService;