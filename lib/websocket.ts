import { io, Socket } from 'socket.io-client';

// Tipos para os eventos recebidos da Evolution API
export interface ConnectionEvent {
  instance: string;
  state: 'open' | 'connecting' | 'close';
  statusReason?: number;
}

export interface QrCodeEvent {
  instance: string;
  qrcode: string;
}

export interface MessageEvent {
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      imageMessage?: any;
      documentMessage?: any;
      audioMessage?: any;
      videoMessage?: any;
    };
    messageTimestamp: number;
    status?: 'ERROR' | 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED';
  };
}

export type EvolutionEventCallback<T> = (data: T) => void;

/**
 * Cliente WebSocket para a Evolution API
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private initialized = false;
  private connectionListeners: EvolutionEventCallback<ConnectionEvent>[] = [];
  private qrcodeListeners: EvolutionEventCallback<QrCodeEvent>[] = [];
  private messageListeners: EvolutionEventCallback<MessageEvent>[] = [];
  private reconnecting = false;

  /**
   * Inicializa a conexão WebSocket com a Evolution API
   */
  initialize(): Promise<boolean> {
    if (this.initialized && this.socket?.connected) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const apiUrl = process.env.EVOLUTION_API_URL;
      
      if (!apiUrl) {
        console.error('EVOLUTION_API_URL não configurada');
        resolve(false);
        return;
      }

      try {
        // Limpeza de socket anterior se existir
        if (this.socket) {
          this.socket.disconnect();
        }

        this.socket = io(apiUrl, {
          transports: ['websocket'],
          query: {
            apikey: process.env.EVOLUTION_API_KEY
          },
          reconnection: true,
          reconnectionDelay: 5000,
          reconnectionAttempts: Infinity
        });

        this.socket.on('connect', () => {
          console.log('WebSocket conectado à Evolution API');
          this.initialized = true;
          this.reconnecting = false;
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`WebSocket desconectado: ${reason}`);
          this.initialized = false;
          
          if (!this.reconnecting) {
            this.reconnecting = true;
            console.log('Tentando reconectar...');
          }
        });

        this.socket.on('error', (error) => {
          console.error('Erro no WebSocket:', error);
        });

        // Configurar handlers para eventos da Evolution API
        this.setupEventHandlers();
      } catch (error) {
        console.error('Erro ao inicializar WebSocket:', error);
        resolve(false);
      }
    });
  }

  /**
   * Configura os handlers para eventos da Evolution API
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    // Evento de atualização de conexão
    this.socket.on('connection.update', (data: ConnectionEvent) => {
      console.log('Evento connection.update:', data);
      this.connectionListeners.forEach(listener => listener(data));
    });

    // Evento de atualização de QR code
    this.socket.on('qrcode.updated', (data: QrCodeEvent) => {
      console.log('Evento qrcode.updated:', data);
      this.qrcodeListeners.forEach(listener => listener(data));
    });

    // Evento de novas mensagens
    this.socket.on('messages.upsert', (data: MessageEvent) => {
      console.log('Nova mensagem recebida:', data);
      this.messageListeners.forEach(listener => listener(data));
    });

    // Evento de atualização de mensagens
    this.socket.on('messages.update', (data: MessageEvent) => {
      console.log('Mensagem atualizada:', data);
      this.messageListeners.forEach(listener => listener(data));
    });
  }

  /**
   * Adiciona um listener para eventos de conexão
   */
  onConnectionUpdate(callback: EvolutionEventCallback<ConnectionEvent>) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Adiciona um listener para eventos de QR code
   */
  onQrCodeUpdate(callback: EvolutionEventCallback<QrCodeEvent>) {
    this.qrcodeListeners.push(callback);
    return () => {
      this.qrcodeListeners = this.qrcodeListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Adiciona um listener para eventos de mensagens
   */
  onMessage(callback: EvolutionEventCallback<MessageEvent>) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Desconecta o WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.initialized = false;
    }
  }

  /**
   * Verifica se o WebSocket está conectado
   */
  isConnected(): boolean {
    return this.initialized && this.socket?.connected === true;
  }
}

// Cliente singleton para compartilhar em toda a aplicação
export const evolutionWebSocket = new WebSocketClient();

export default evolutionWebSocket;