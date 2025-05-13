'use client';

import { useState, useEffect } from 'react';
import { evolutionWebSocket, MessageEvent } from '@/lib/websocket';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  fromMe: boolean;
  timestamp: number;
  sender: string;
}

export default function WhatsAppMessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [instanceName, setInstanceName] = useState<string>('agentesconversao');
  const [webSocketConnected, setWebSocketConnected] = useState<boolean>(false);

  // Inicializar o WebSocket quando o componente montar
  useEffect(() => {
    const initWebSocket = async () => {
      const connected = await evolutionWebSocket.initialize();
      setWebSocketConnected(connected);
    };

    initWebSocket();
  }, []);

  // Configurar listeners para mensagens
  useEffect(() => {
    if (!webSocketConnected) return;

    // Listener para novas mensagens
    const messageUnsubscribe = evolutionWebSocket.onMessage((event: MessageEvent) => {
      if (event.instance === instanceName) {
        const content = event.data.message.conversation || 
                       'Mídia: ' + (
                         event.data.message.imageMessage ? 'Imagem' : 
                         event.data.message.documentMessage ? 'Documento' : 
                         event.data.message.audioMessage ? 'Áudio' : 
                         event.data.message.videoMessage ? 'Vídeo' : 'Outro'
                       );

        const sender = event.data.key.remoteJid?.split('@')[0] || 'Desconhecido';
        
        const newMessage: Message = {
          id: event.data.key.id,
          content,
          fromMe: event.data.key.fromMe,
          timestamp: event.data.messageTimestamp,
          sender
        };

        setMessages(prevMessages => {
          // Verificar se a mensagem já existe
          const exists = prevMessages.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prevMessages.map(msg => 
              msg.id === newMessage.id ? newMessage : msg
            );
          } else {
            return [...prevMessages, newMessage];
          }
        });
      }
    });

    // Limpeza
    return () => {
      messageUnsubscribe();
    };
  }, [webSocketConnected, instanceName]);

  // Formatar timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Mensagens Recebidas</h2>
      
      {!webSocketConnected && (
        <div className="p-2 mt-2 bg-yellow-900 text-yellow-300 rounded">
          Aguardando conexão WebSocket...
        </div>
      )}
      
      <div className="mt-4">
        <input
          type="text"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-4"
          placeholder="Nome da instância"
        />
      </div>

      {messages.length === 0 ? (
        <div className="text-gray-400 py-4 text-center">
          Nenhuma mensagem recebida ainda.
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`p-3 rounded-lg ${
                message.fromMe ? 'bg-blue-900 ml-12' : 'bg-gray-700 mr-12'
              }`}
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">
                  {message.fromMe ? 'Você' : message.sender}
                </span>
                <span className="text-gray-400">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}