'use client';

import { useState } from 'react';
import { sendTextMessage } from '@/lib/evolution-api';
import { cn } from '@/lib/utils';

export default function WhatsAppSender() {
  const [instanceName, setInstanceName] = useState<string>('agentesconversao');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      setStatus({
        success: false,
        message: 'Por favor, preencha o número de telefone e a mensagem.'
      });
      return;
    }

    try {
      setSending(true);
      setStatus(null);

      // Remover caracteres não numéricos do telefone
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Enviar mensagem através da API
      const response = await sendTextMessage(instanceName, formattedPhone, message);
      
      if (response.success) {
        setStatus({
          success: true,
          message: 'Mensagem enviada com sucesso!'
        });
        
        // Limpar o campo de mensagem após envio bem-sucedido
        setMessage('');
      } else {
        setStatus({
          success: false,
          message: response.message || 'Erro ao enviar mensagem.'
        });
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      setStatus({
        success: false,
        message: error.message || 'Erro ao enviar mensagem. Verifique o console para mais detalhes.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Enviar Mensagem</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Instância</label>
          <input
            type="text"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Nome da instância"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Número de Telefone</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Ex: 5511999999999"
          />
          <p className="text-xs text-gray-400 mt-1">
            Inclua o código do país (Ex: 55 para Brasil) e DDD
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Mensagem</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white h-24"
            placeholder="Digite sua mensagem aqui..."
          />
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={sending || !phoneNumber || !message}
          className={cn(
            "w-full py-2 rounded font-medium transition-colors",
            sending ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700",
            (!phoneNumber || !message) && "opacity-50 cursor-not-allowed"
          )}
        >
          {sending ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
        
        {status && (
          <div className={cn(
            "p-3 rounded mt-2",
            status.success ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
          )}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}