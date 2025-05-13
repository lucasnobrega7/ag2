import WhatsAppConnection from '@/components/whatsapp/WhatsAppConnection';
import WhatsAppMessageList from '@/components/whatsapp/WhatsAppMessageList';
import WhatsAppSender from '@/components/whatsapp/WhatsAppSender';

export const metadata = {
  title: 'WhatsApp Integration - Agentes de Conversão',
  description: 'Configure a integração com WhatsApp para seus agentes de conversão',
};

export default function WhatsAppIntegrationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Integração com WhatsApp</h1>

      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          Configure a integração com WhatsApp para enviar e receber mensagens através dos seus agentes de conversão.
        </p>
        <p className="text-gray-300 mb-4">
          O processo de integração envolve:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
          <li>Conectar-se à Evolution API via WebSocket</li>
          <li>Escanear o QR Code quando disponível</li>
          <li>Enviar e receber mensagens em tempo real</li>
        </ol>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Importante</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-300">
          <li>Utilize um número de WhatsApp exclusivo para esta integração</li>
          <li>O dispositivo deverá estar conectado à internet para enviar/receber mensagens</li>
          <li>Respeite os termos de uso do WhatsApp para envio de mensagens em massa</li>
          <li>Conexão em tempo real via WebSocket para notificações instantâneas</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <WhatsAppConnection />
          <WhatsAppSender />
        </div>
        <div>
          <WhatsAppMessageList />
        </div>
      </div>
    </div>
  );
}