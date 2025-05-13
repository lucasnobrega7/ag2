'use client';

import { useState, useEffect } from 'react';
import { evolutionWebSocket, ConnectionEvent, QrCodeEvent } from '@/lib/websocket';
import { cn } from '@/lib/utils';

export default function WhatsAppConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('agentesconversao');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [webSocketConnected, setWebSocketConnected] = useState<boolean>(false);

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
    };
  }, []);

  // Configurar listeners para eventos
  useEffect(() => {
    if (!webSocketConnected) return;

    // Listener para status de conexão
    const connectionUnsubscribe = evolutionWebSocket.onConnectionUpdate((event: ConnectionEvent) => {
      if (event.instance === instanceName) {
        setConnectionStatus(event.state);
        
        // Se conectado, não mostrar mais o QR code
        if (event.state === 'open') {
          setQrCodeUrl('');
          setConnecting(false);
        }
      }
    });

    // Listener para atualizações de QR code
    const qrCodeUnsubscribe = evolutionWebSocket.onQrCodeUpdate((event: QrCodeEvent) => {
      if (event.instance === instanceName) {
        setQrCodeUrl(event.qrcode);
      }
    });

    // Limpeza
    return () => {
      connectionUnsubscribe();
      qrCodeUnsubscribe();
    };
  }, [webSocketConnected, instanceName]);

  // Status da conexão WebSocket
  const renderWebSocketStatus = () => {
    if (!webSocketConnected) {
      return (
        <div className="p-2 mt-2 bg-yellow-900 text-yellow-300 rounded">
          Conectando ao servidor WebSocket...
        </div>
      );
    }
    
    return (
      <div className="p-2 mt-2 bg-green-900 text-green-300 rounded">
        WebSocket conectado
      </div>
    );
  };

  // Renderizar status da conexão WhatsApp
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
      <div className={cn('p-3 mt-4 rounded', statusClass)}>
        <p className="font-medium">Status: {statusText}</p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Conexão WhatsApp via WebSocket</h2>
      
      {renderWebSocketStatus()}
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Nome da Instância</label>
        <input
          type="text"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>

      {renderConnectionStatus()}
      
      {qrCodeUrl && (
        <div className="mt-6">
          <p className="mb-2">Escaneie o QR Code com seu WhatsApp:</p>
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
    </div>
  );
}