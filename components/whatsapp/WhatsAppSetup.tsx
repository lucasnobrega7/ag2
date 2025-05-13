'use client';

import { useState, useEffect } from 'react';
import { createInstance, getQrCode, getConnectionStatus } from '@/lib/evolution-api';
import { cn } from '@/lib/utils';

export default function WhatsAppSetup() {
  const [instanceName, setInstanceName] = useState('agentesconversao');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function setupInstance() {
    setLoading(true);
    setError('');

    try {
      // Criar instância
      console.log("Iniciando criação da instância:", instanceName);
      const instanceResult = await createInstance(instanceName);
      console.log("Resultado da criação:", instanceResult);

      // Dar um pequeno tempo para API processar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Obter QR Code
      console.log("Solicitando QR code...");
      const qrResponse = await getQrCode(instanceName);
      console.log("Resposta QR code:", qrResponse);

      if (qrResponse?.success && qrResponse?.qrcode) {
        setQrCodeUrl(qrResponse.qrcode);
        console.log("QR Code definido com sucesso");
      } else {
        console.error("QR Code inválido na resposta:", qrResponse);
        throw new Error('Não foi possível obter o QR Code. Resposta inválida.');
      }

      // Verificar status
      checkStatus();
    } catch (err: any) {
      console.error('Erro na configuração:', err?.response?.data || err);
      setError(err?.response?.data?.message || err?.message || 'Erro ao configurar a instância do WhatsApp. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }
  
  async function checkStatus() {
    try {
      const statusResponse = await getConnectionStatus(instanceName);
      if (statusResponse.success) {
        setStatus(statusResponse.state);
        
        // Se estiver conectado, não precisamos mais do QR Code
        if (statusResponse.state === 'open') {
          setQrCodeUrl('');
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  }
  
  useEffect(() => {
    // Verificar status periodicamente
    let interval: NodeJS.Timeout;
    
    if (qrCodeUrl) {
      interval = setInterval(checkStatus, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrCodeUrl]);
  
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Configuração do WhatsApp</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nome da Instância</label>
        <input
          type="text"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      
      <button
        onClick={setupInstance}
        disabled={loading}
        className={cn(
          "px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading ? 'Configurando...' : 'Configurar WhatsApp'}
      </button>
      
      {error && (
        <div className="mt-4 p-2 bg-red-600 rounded text-white">{error}</div>
      )}
      
      {status && (
        <div className="mt-4">
          <p>Status: <span className="font-semibold">{status}</span></p>
          {status === 'open' && (
            <p className="text-green-400 mt-2">✓ WhatsApp conectado com sucesso!</p>
          )}
        </div>
      )}
      
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