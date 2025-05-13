import axios from 'axios';
import { evolutionWebSocket } from './websocket';

/**
 * Cliente para a Evolution QR (versão avançada) para integração com WhatsApp
 * Incluindo recursos de proteção contra banimento e balanceamento de carga
 */

export interface EvolutionQROptions {
  useProxy?: boolean;
  webhookUrl?: string;
  instanceName?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrcode?: string;
  message?: string;
  expiresAt?: number;
}

export interface ConnectionStatusResponse {
  success: boolean;
  state: 'open' | 'connecting' | 'close';
  message?: string;
}

/**
 * Cliente para a Evolution QR API
 */
const evolutionQR = {
  /**
   * Obter QR Code para conexão WhatsApp utilizando a Evolution QR API
   * Inclui sistema de proxy rotativo para proteção contra banimento
   */
  async getQRCode(options: EvolutionQROptions = {}): Promise<QRCodeResponse> {
    try {
      const baseUrl = process.env.EVOLUTION_API_URL;
      
      if (!baseUrl) {
        throw new Error('EVOLUTION_API_URL não configurada');
      }
      
      const instanceName = options.instanceName || 'super-agentes';
      const useProxy = options.useProxy !== false; // Habilitado por padrão
      const webhookUrl = options.webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`;
      
      // Iniciar a conexão WebSocket para monitoramento em tempo real
      await evolutionWebSocket.initialize();
      
      const response = await axios.post(`${baseUrl}/instance/create`, {
        instanceName,
        webhook: webhookUrl,
        webhookByEvents: true,
        useProxy: useProxy,
        useHostBalancing: true, // Balanceamento de hosts para maior estabilidade
        events: {
          QRCODE_UPDATED: true,
          MESSAGES_UPSERT: true,
          MESSAGES_UPDATE: true,
          CONNECTION_UPDATE: true
        },
        instanceConfig: {
          proxyOptions: useProxy ? {
            enabled: true,
            type: 'webshare', // Sistema de proxy rotativo
            autoRotate: true,
            interval: 600 // Rotação a cada 10 minutos
          } : undefined,
          reconnectOptions: {
            maxRetries: 5,
            delayMs: 3000
          },
          markMessagesRead: true,
          disableWebhook: false
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EVOLUTION_API_KEY
        }
      });
      
      if (response.data.success) {
        // Se sucesso, obter QR Code
        return await this.fetchQRCode(instanceName);
      } else {
        throw new Error(response.data.message || 'Erro ao criar instância WhatsApp');
      }
    } catch (error: any) {
      console.error('Erro ao obter QR Code:', error?.response?.data || error.message);
      return {
        success: false,
        message: error?.response?.data?.message || error.message
      };
    }
  },
  
  /**
   * Obter o QR Code para uma instância
   */
  async fetchQRCode(instanceName: string): Promise<QRCodeResponse> {
    try {
      const baseUrl = process.env.EVOLUTION_API_URL;
      
      // Tenta obter o QR Code com multiple endpoints para suporte a diferentes versões
      try {
        // Endpoint Evolution QR
        const response = await axios.get(`${baseUrl}/instance/qrcode/${instanceName}?image=true`, {
          headers: {
            'apikey': process.env.EVOLUTION_API_KEY
          }
        });
        
        if (response.data.success && response.data.qrcode) {
          // Adicionar tempo de expiração (2 minutos)
          const expiresAt = Date.now() + 2 * 60 * 1000;
          
          return {
            ...response.data,
            expiresAt
          };
        }
      } catch (e) {
        console.log('Tentando endpoint alternativo para QR Code...');
      }
      
      // Tentar endpoint alternativo (Evolution API padrão)
      const response = await axios.get(`${baseUrl}/api/instance/qrcode/${instanceName}`, {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      });
      
      // Adicionar tempo de expiração (2 minutos)
      const expiresAt = Date.now() + 2 * 60 * 1000;
      
      return {
        success: true,
        qrcode: response.data.qrcode || response.data.base64,
        expiresAt
      };
    } catch (error: any) {
      console.error('Erro ao obter QR Code:', error?.response?.data || error.message);
      return {
        success: false,
        message: error?.response?.data?.message || error.message
      };
    }
  },
  
  /**
   * Verificar o status da conexão
   */
  async checkConnectionStatus(instanceName: string): Promise<ConnectionStatusResponse> {
    try {
      const baseUrl = process.env.EVOLUTION_API_URL;
      
      const response = await axios.get(`${baseUrl}/instance/connectionState/${instanceName}`, {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar status da conexão:', error?.response?.data || error.message);
      return {
        success: false,
        state: 'close',
        message: error?.response?.data?.message || error.message
      };
    }
  },
  
  /**
   * Deletar uma instância
   */
  async deleteInstance(instanceName: string): Promise<boolean> {
    try {
      const baseUrl = process.env.EVOLUTION_API_URL;
      
      await axios.delete(`${baseUrl}/instance/delete/${instanceName}`, {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      return false;
    }
  }
};

export default evolutionQR;