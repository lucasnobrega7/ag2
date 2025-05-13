'use client';

import { useState, useEffect } from 'react';
import { EvolutionAPIService } from '@/lib/evolution-api-service';
import { evolutionWebSocket, ConnectionEvent, QrCodeEvent, MessageEvent } from '@/lib/websocket';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  fromMe: boolean;
  timestamp: number;
  sender: string;
}

export default function WhatsAppDashboard() {
  // Estado da conexão
  const [instanceName, setInstanceName] = useState<string>('super-agentes');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeExpiry, setQrCodeExpiry] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [webSocketConnected, setWebSocketConnected] = useState<boolean>(false);
  
  // Estado de mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [contactInput, setContactInput] = useState<string>('');
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // Estado de contatos
  const [contacts, setContacts] = useState<Array<{id: string, name: string}>>([]);
  const [contactsLoading, setContactsLoading] = useState<boolean>(false);

  // Inicializar o WebSocket quando o componente montar
  useEffect(() => {
    const initWebSocket = async () => {
      const connected = await evolutionWebSocket.initialize();
      setWebSocketConnected(connected);
      
      if (connected) {
        checkConnectionStatus();
      }
    };

    initWebSocket();

    // Limpar ao desmontar
    return () => {
      evolutionWebSocket.disconnect();
    };
  }, []);

  // Configurar listeners para eventos do WebSocket
  useEffect(() => {
    if (!webSocketConnected) return;

    // Listener para status de conexão
    const connectionUnsubscribe = evolutionWebSocket.onConnectionUpdate((event: ConnectionEvent) => {
      if (event.instance === instanceName) {
        setConnectionStatus(event.state);
        setIsConnected(event.state === 'open');
        
        // Se conectado, não mostrar mais o QR code
        if (event.state === 'open') {
          setQrCodeUrl('');
          fetchContacts();
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
      }
    });
    
    // Listener para mensagens recebidas
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
        
        // Só adicionar mensagem se corresponder ao contato selecionado
        if (sender === selectedContact || event.data.key.fromMe) {
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
      }
    });

    // Limpeza
    return () => {
      connectionUnsubscribe();
      qrCodeUnsubscribe();
      messageUnsubscribe();
    };
  }, [webSocketConnected, instanceName, selectedContact]);

  // Verificar status da conexão
  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const status = await EvolutionAPIService.checkConnection(instanceName);
      
      setConnectionStatus(status.state || 'close');
      setIsConnected(status.connected || false);
      
      if (status.connected) {
        fetchContacts();
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obter contatos
  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const result = await EvolutionAPIService.getContacts(instanceName);
      
      if (result.success && result.contacts) {
        // Filtrar e formatar contatos
        const formattedContacts = result.contacts
          .filter(contact => !contact.isGroup)
          .map(contact => ({
            id: contact.id.split('@')[0],
            name: contact.name || contact.pushName || contact.id.split('@')[0]
          }));
        
        setContacts(formattedContacts);
      }
    } catch (err) {
      console.error('Erro ao obter contatos:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  // Obter mensagens do contato selecionado
  const fetchMessages = async (contactPhone: string) => {
    try {
      setLoading(true);
      const result = await EvolutionAPIService.getMessagesByPhone(
        contactPhone,
        { instanceName, count: 20 }
      );
      
      if (result.success && result.messages) {
        // Formatar mensagens
        const formattedMessages = result.messages.map(msg => ({
          id: msg.key.id,
          content: msg.message.conversation || 'Mídia: ' + (
            msg.message.imageMessage ? 'Imagem' : 
            msg.message.documentMessage ? 'Documento' : 
            msg.message.audioMessage ? 'Áudio' : 
            msg.message.videoMessage ? 'Vídeo' : 'Outro'
          ),
          fromMe: msg.key.fromMe,
          timestamp: msg.messageTimestamp,
          sender: msg.key.remoteJid.split('@')[0]
        }));
        
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Erro ao obter mensagens:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Selecionar contato
  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
    fetchMessages(contactId);
  };

  // Adicionar contato
  const handleAddContact = () => {
    if (!contactInput) return;
    
    // Formatar número e verificar se já existe
    const formattedPhone = contactInput.replace(/\D/g, '');
    const exists = contacts.some(c => c.id === formattedPhone);
    
    if (!exists) {
      setContacts([...contacts, {
        id: formattedPhone,
        name: formattedPhone
      }]);
    }
    
    setContactInput('');
    setSelectedContact(formattedPhone);
    fetchMessages(formattedPhone);
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!messageInput || !selectedContact || !isConnected) return;
    
    try {
      setIsSending(true);
      
      const result = await EvolutionAPIService.sendTextMessage(
        selectedContact,
        messageInput,
        { instanceName }
      );
      
      if (result.success) {
        // Limpar input e adicionar mensagem ao chat
        setMessageInput('');
        
        // A mensagem enviada será capturada pelo listener de mensagens
        // mas podemos adicioná-la manualmente para feedback imediato
        const newMessage: Message = {
          id: result.messageId || Date.now().toString(),
          content: messageInput,
          fromMe: true,
          timestamp: Math.floor(Date.now() / 1000),
          sender: 'me'
        };
        
        setMessages(prev => [...prev, newMessage]);
      } else {
        setError('Erro ao enviar mensagem: ' + result.error);
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  // Criar QR Code
  const handleCreateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      setQrCodeUrl('');
      
      // Criar/reiniciar instância
      const instanceResult = await EvolutionAPIService.createOrRestartInstance(
        instanceName,
        `${window.location.origin}/api/whatsapp/webhook`,
        true // Usar proxy para proteção
      );
      
      if (!instanceResult.success) {
        setError('Erro ao criar instância: ' + instanceResult.message);
        return;
      }
      
      // Obter QR Code
      const qrResult = await EvolutionAPIService.getQRCode(instanceName);
      
      if (qrResult.success && qrResult.qrcode) {
        setQrCodeUrl(qrResult.qrcode);
        
        if (qrResult.expiresAt) {
          setQrCodeExpiry(qrResult.expiresAt);
        }
      } else {
        setError('Erro ao obter QR Code: ' + qrResult.message);
      }
    } catch (err: any) {
      console.error('Erro ao criar QR Code:', err);
      setError(err.message || 'Erro ao criar QR Code');
    } finally {
      setLoading(false);
    }
  };

  // Desconectar
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      
      await EvolutionAPIService.disconnect(instanceName);
      setConnectionStatus('close');
      setIsConnected(false);
      setQrCodeUrl('');
      setMessages([]);
      setSelectedContact('');
      
    } catch (err: any) {
      console.error('Erro ao desconectar:', err);
      setError(err.message || 'Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  // Deletar instância
  const handleDeleteInstance = async () => {
    try {
      setLoading(true);
      
      await EvolutionAPIService.deleteInstance(instanceName);
      setConnectionStatus('close');
      setIsConnected(false);
      setQrCodeUrl('');
      setMessages([]);
      setSelectedContact('');
      setContacts([]);
      
    } catch (err: any) {
      console.error('Erro ao deletar instância:', err);
      setError(err.message || 'Erro ao deletar instância');
    } finally {
      setLoading(false);
    }
  };

  // Formatar timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Painel de Status e Conexão - 3 colunas */}
        <div className="md:col-span-3 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Status da Conexão</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nome da Instância</label>
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              disabled={loading || isConnected}
            />
          </div>
          
          <div className={cn(
            "p-3 mb-4 rounded text-center",
            connectionStatus === 'open' ? "bg-green-900 text-green-300" :
            connectionStatus === 'connecting' ? "bg-yellow-900 text-yellow-300" :
            "bg-red-900 text-red-300"
          )}>
            <p className="font-medium">
              Status: {
                connectionStatus === 'open' ? 'Conectado' :
                connectionStatus === 'connecting' ? 'Conectando...' :
                'Desconectado'
              }
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleCreateQRCode}
              disabled={loading || isConnected}
              className={cn(
                "p-2 rounded font-medium transition-colors",
                loading ? "bg-gray-600 cursor-not-allowed" : 
                isConnected ? "bg-gray-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              )}
            >
              {loading ? 'Processando...' : 'Obter QR Code'}
            </button>
            
            <button
              onClick={handleDisconnect}
              disabled={loading || !isConnected}
              className={cn(
                "p-2 rounded font-medium transition-colors",
                loading ? "bg-gray-600 cursor-not-allowed" : 
                !isConnected ? "bg-gray-700 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
              )}
            >
              Desconectar
            </button>
            
            <button
              onClick={handleDeleteInstance}
              disabled={loading}
              className={cn(
                "p-2 rounded font-medium transition-colors",
                loading ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              )}
            >
              Deletar Instância
            </button>
          </div>
          
          {qrCodeUrl && (
            <div className="mt-4 text-center">
              <p className="mb-2">Escaneie o QR Code:</p>
              <div className="inline-block bg-white p-3 rounded">
                <img 
                  src={qrCodeUrl} 
                  alt="WhatsApp QR Code" 
                  width={200} 
                  height={200} 
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Abra o WhatsApp e escaneie este código
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-2 bg-red-900 text-red-300 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-xs text-gray-400">
              Conexão protegida com proxy rotativo e balanceamento de hosts.
            </p>
          </div>
        </div>
        
        {/* Lista de Contatos - 3 colunas */}
        <div className="md:col-span-3 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Contatos</h2>
          
          <div className="flex mb-4">
            <input 
              type="text" 
              placeholder="Adicionar contato" 
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              className="flex-grow p-2 rounded-l bg-gray-700 text-white"
            />
            <button
              onClick={handleAddContact}
              disabled={!contactInput || !isConnected}
              className={cn(
                "px-3 rounded-r font-medium",
                !contactInput || !isConnected ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              +
            </button>
          </div>
          
          {contactsLoading ? (
            <div className="text-center py-4 text-gray-400">
              Carregando contatos...
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Nenhum contato disponível
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {contacts.map(contact => (
                <div 
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={cn(
                    "p-2 rounded cursor-pointer transition-colors",
                    selectedContact === contact.id ? "bg-blue-900" : "hover:bg-gray-700"
                  )}
                >
                  <p className="font-medium truncate">{contact.name}</p>
                  <p className="text-xs text-gray-400 truncate">{contact.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Janela de Mensagens - 6 colunas */}
        <div className="md:col-span-6 bg-gray-800 rounded-lg p-4 flex flex-col h-[500px]">
          <h2 className="text-lg font-semibold mb-2">
            {selectedContact ? (
              <span>
                Conversa com{' '}
                {contacts.find(c => c.id === selectedContact)?.name || selectedContact}
              </span>
            ) : 'Mensagens'}
          </h2>
          
          {!isConnected ? (
            <div className="flex-grow flex items-center justify-center text-gray-400">
              Conecte-se ao WhatsApp para enviar e receber mensagens
            </div>
          ) : !selectedContact ? (
            <div className="flex-grow flex items-center justify-center text-gray-400">
              Selecione um contato para ver as mensagens
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto p-2 space-y-3">
                {loading ? (
                  <div className="text-center py-4 text-gray-400">
                    Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    Nenhuma mensagem disponível
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id}
                      className={cn(
                        "p-3 rounded-lg max-w-[80%]",
                        message.fromMe 
                          ? "bg-blue-900 ml-auto" 
                          : "bg-gray-700 mr-auto"
                      )}
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">
                          {message.fromMe ? 'Você' : message.sender}
                        </span>
                        <span className="text-gray-400">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="break-words">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-2 flex items-center">
                <input
                  type="text"
                  placeholder="Escreva uma mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow p-2 rounded-l bg-gray-700 text-white"
                  disabled={!isConnected || !selectedContact || isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !selectedContact || !messageInput || isSending}
                  className={cn(
                    "px-4 py-2 rounded-r font-medium",
                    !isConnected || !selectedContact || !messageInput || isSending
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isSending ? '...' : 'Enviar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}