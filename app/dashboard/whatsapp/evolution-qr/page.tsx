import EvolutionQRSetup from '@/components/whatsapp/EvolutionQRSetup';
import WhatsAppMessageList from '@/components/whatsapp/WhatsAppMessageList';
import WhatsAppSender from '@/components/whatsapp/WhatsAppSender';

export const metadata = {
  title: 'WhatsApp Integration via Evolution QR - Agentes de Conversão',
  description: 'Configure a integração com WhatsApp usando Evolution QR com proteção contra banimento',
};

export default function EvolutionQRPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Integração com WhatsApp via Evolution QR</h1>
      
      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          Configure a integração com WhatsApp usando o Evolution QR, que inclui recursos avançados de proteção contra banimento e balanceamento de carga.
        </p>
        
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="text-blue-300 font-semibold mb-2">Recursos de Proteção</h3>
          <ul className="list-disc pl-6 space-y-1 text-gray-300">
            <li><span className="text-blue-300 font-medium">Proxy Rotativo:</span> Sistema que alterna entre diferentes IPs para reduzir o risco de banimento</li>
            <li><span className="text-blue-300 font-medium">Balanceamento de Hosts:</span> Distribui conexões entre múltiplos servidores para maior estabilidade</li>
            <li><span className="text-blue-300 font-medium">Verificação em Tempo Real:</span> Monitora constantemente o status da conexão</li>
            <li><span className="text-blue-300 font-medium">Reconexão Automática:</span> Facilita a reconexão em caso de desconexão</li>
          </ul>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Aviso Importante</h3>
          <p className="text-gray-300">
            A Evolution API QR Code é uma alternativa não oficial para integração com WhatsApp. Embora inclua recursos avançados de proteção, 
            ainda existe um risco reduzido de que números conectados possam ser banidos pelo WhatsApp. Use por sua conta e risco.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <EvolutionQRSetup />
          <WhatsAppSender />
        </div>
        <div>
          <WhatsAppMessageList />
        </div>
      </div>
      
      <div className="mt-8 bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Como Funciona</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-green-400 font-bold text-xl mb-2">1</div>
            <h3 className="font-semibold mb-2">Gerar QR Code</h3>
            <p className="text-sm text-gray-300">
              Clique no botão "Gerar QR Code" para criar uma instância protegida e obter um código QR para conexão.
            </p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-green-400 font-bold text-xl mb-2">2</div>
            <h3 className="font-semibold mb-2">Escanear com WhatsApp</h3>
            <p className="text-sm text-gray-300">
              Abra o WhatsApp no seu celular, vá em Configurações > Dispositivos Conectados e escaneie o QR Code.
            </p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-green-400 font-bold text-xl mb-2">3</div>
            <h3 className="font-semibold mb-2">Pronto para Usar</h3>
            <p className="text-sm text-gray-300">
              Após a confirmação, seu agente estará conectado ao WhatsApp e pronto para enviar e receber mensagens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}