'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import evolutionQR from '@/lib/evolution-qr';
import { evolutionWebSocket, ConnectionEvent, QrCodeEvent } from '@/lib/websocket';

export default function EvolutionQRSetup() {
  const [instanceName, setInstanceName] = useState<string>('super-agentes');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeExpiry, setQrCodeExpiry] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [webSocketConnected, setWebSocketConnected] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar o WebSocket quando o componente montar
  useEffect(() => {
    const initWebSocket = async () => {
      const connected = await evolutionWebSocket.initialize();
      setWebSocketConnected(connected);
    };

    initWebSocket();

    // Limpar ao desmontar
    return () => {
      evolutionWebSocket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusCheckIntervalRef.current) clearInterval(statusCheckIntervalRef.current);
    };
  }, []);

  // Configurar listeners para eventos do WebSocket
  useEffect(() => {
    if (!webSocketConnected) return;

    // Listener para status de conexão
    const connectionUnsubscribe = evolutionWebSocket.onConnectionUpdate((event: ConnectionEvent) => {
      if (event.instance === instanceName) {
        setConnectionStatus(event.state);
        
        // Se conectado, não mostrar mais o QR code
        if (event.state === 'open') {
          setQrCodeUrl('');
          setSuccess(true);
          setLoading(false);
          
          // Parar o contador se estiver rodando
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    });

    // Listener para atualizações de QR code via WebSocket
    const qrCodeUnsubscribe = evolutionWebSocket.onQrCodeUpdate((event: QrCodeEvent) => {
      if (event.instance === instanceName) {
        setQrCodeUrl(event.qrcode);
        
        // Definir nova expiração (2 minutos a partir de agora)
        const newExpiry = Date.now() + 2 * 60 * 1000;
        setQrCodeExpiry(newExpiry);
        
        // Iniciar contador de tempo
        startCountdown(newExpiry);
      }
    });

    // Limpeza
    return () => {
      connectionUnsubscribe();
      qrCodeUnsubscribe();
    };
  }, [webSocketConnected, instanceName]);

  // Função para iniciar a contagem regressiva
  const startCountdown = (expiryTime: number) => {
    // Limpar timer anterior se existir
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calcular tempo restante inicial
    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setCountdown(remaining);
      
      // Se expirou, limpar o QR code
      if (remaining <= 0 && qrCodeUrl) {
        setQrCodeUrl('');
        setError('QR Code expirado. Gere um novo para continuar.');
        clearInterval(timerRef.current as NodeJS.Timeout);
        timerRef.current = null;
      }
    };
    
    // Iniciar com valor atual
    updateCountdown();
    
    // Atualizar a cada segundo
    timerRef.current = setInterval(updateCountdown, 1000);
  };

  // Função para gerar o QR Code
  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setQrCodeUrl('');
      
      // Parar verificação de status anterior se existir
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      
      // Obter QR Code
      const response = await evolutionQR.getQRCode({
        instanceName,
        useProxy: true,
        webhookUrl: `${window.location.origin}/api/whatsapp/webhook`
      });
      
      if (response.success && response.qrcode) {
        setQrCodeUrl(response.qrcode);
        
        // Definir expiração
        if (response.expiresAt) {
          setQrCodeExpiry(response.expiresAt);
          startCountdown(response.expiresAt);
        } else {
          // Definir expiração padrão (2 minutos)
          const defaultExpiry = Date.now() + 2 * 60 * 1000;
          setQrCodeExpiry(defaultExpiry);
          startCountdown(defaultExpiry);
        }
        
        // Iniciar verificação periódica de status
        startStatusCheck();
      } else {
        setError(response.message || 'Erro ao gerar QR Code. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar QR Code:', err);
      setError(err.message || 'Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Verificação periódica do status de conexão
  const startStatusCheck = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
    
    // Verificar status imediatamente
    checkConnectionStatus();
    
    // Verificar a cada 15 segundos
    statusCheckIntervalRef.current = setInterval(checkConnectionStatus, 15000);
  };

  // Verificar status da conexão
  const checkConnectionStatus = async () => {
    try {
      const status = await evolutionQR.checkConnectionStatus(instanceName);
      setConnectionStatus(status.state);
      
      // Se conectado com sucesso
      if (status.state === 'open') {
        setSuccess(true);
        setQrCodeUrl('');
        
        // Parar o contador e as verificações de status
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  // Deletar instância e reiniciar
  const deleteInstance = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setQrCodeUrl('');
      setConnectionStatus('');
      
      // Deletar instância na API
      await evolutionQR.deleteInstance(instanceName);
      
      // Limpar timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    } catch (err: any) {
      console.error('Erro ao deletar instância:', err);
      setError(err.message || 'Erro ao deletar instância. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatar o tempo restante
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Status da conexão WebSocket
  const renderWebSocketStatus = () => {
    if (!webSocketConnected) {
      return (
        <div className="p-2 mt-2 bg-yellow-900 text-yellow-300 rounded text-sm">
          Tentando conectar ao servidor WebSocket...
        </div>
      );
    }
    return null;
  };

  // Renderizar o status da conexão
  const renderConnectionStatus = () => {
    if (!connectionStatus) return null;

    let statusClass = '';
    let statusText = '';

    switch (connectionStatus) {
      case 'open':
        statusClass = 'bg-green-900 text-green-300';
        statusText = 'Conectado';
        break;
      case 'connecting':
        statusClass = 'bg-yellow-900 text-yellow-300';
        statusText = 'Conectando...';
        break;
      case 'close':
        statusClass = 'bg-red-900 text-red-300';
        statusText = 'Desconectado';
        break;
      default:
        statusClass = 'bg-gray-800 text-gray-300';
        statusText = connectionStatus;
    }

    return (
      <div className={cn('p-3 mt-4 rounded text-center', statusClass)}>
        <p className="font-medium">Status: {statusText}</p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Conexão WhatsApp via Evolution QR</h2>
      
      {renderWebSocketStatus()}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nome da Instância</label>
        <input
          type="text"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          disabled={loading || success}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={generateQRCode}
          disabled={loading || !webSocketConnected || !instanceName}
          className={cn(
            "flex-grow py-2 rounded font-medium transition-colors",
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700",
            (!webSocketConnected || !instanceName) && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? 'Gerando...' : 'Gerar QR Code'}
        </button>
        
        {connectionStatus && (
          <button
            onClick={deleteInstance}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded font-medium transition-colors",
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            )}
          >
            <span>Desconectar</span>
          </button>
        )}
      </div>
      
      {renderConnectionStatus()}
      
      {error && (
        <div className="mt-4 p-2 bg-red-900 text-red-300 rounded text-center">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-4 bg-green-900 text-green-300 rounded text-center">
          <p className="font-medium">✓ WhatsApp conectado com sucesso!</p>
          <p className="text-sm mt-1">
            Seu agente agora está pronto para receber e responder mensagens no WhatsApp.
          </p>
        </div>
      )}
      
      {qrCodeUrl && (
        <div className="mt-6 text-center">
          <div className="flex items-center justify-between mb-2">
            <p>Escaneie o QR Code com seu WhatsApp:</p>
            {countdown > 0 && (
              <span className="text-yellow-300 text-sm font-medium">
                Expira em {formatCountdown(countdown)}
              </span>
            )}
          </div>
          <div className="inline-block bg-white p-4 rounded">
            <img 
              src={qrCodeUrl} 
              alt="WhatsApp QR Code" 
              width={256} 
              height={256} 
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            No WhatsApp, acesse Configurações &gt; Dispositivos Conectados &gt; Conectar um dispositivo
          </p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400">
        <p>
          <strong>Nota:</strong> Esta integração utiliza proxy rotativo e balanceamento de hosts para reduzir o risco de banimento.
        </p>
      </div>
    </div>
  );
}