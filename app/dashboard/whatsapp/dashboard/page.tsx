import WhatsAppDashboard from '@/components/whatsapp/WhatsAppDashboard';

export const metadata = {
  title: 'WhatsApp Dashboard - Agentes de Conversão',
  description: 'Painel de controle para gerenciar conversas e conexões do WhatsApp',
};

export default function WhatsAppDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Painel de WhatsApp</h1>
      
      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          Gerencie sua integração com WhatsApp, envie e receba mensagens, e monitore suas conversas em um único painel.
        </p>
        
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="text-blue-300 font-semibold mb-2">Características</h3>
          <ul className="list-disc pl-6 space-y-1 text-gray-300">
            <li><span className="text-blue-300 font-medium">Proteção Avançada:</span> Proxy rotativo para reduzir risco de banimento</li>
            <li><span className="text-blue-300 font-medium">Interface Completa:</span> Gerencie contatos, mensagens e status em um só lugar</li>
            <li><span className="text-blue-300 font-medium">Monitoramento Tempo Real:</span> Acompanhe status da conexão e novas mensagens</li>
            <li><span className="text-blue-300 font-medium">Conversas Unificadas:</span> Acesse todo histórico de conversas com seus contatos</li>
          </ul>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Aviso Importante</h3>
          <p className="text-gray-300">
            Esta integração utiliza a Evolution API, uma alternativa não oficial para WhatsApp. 
            Embora incluamos recursos avançados de proteção, ainda existe um risco reduzido de 
            que números conectados possam ser banidos pelo WhatsApp. Use por sua conta e risco.
          </p>
        </div>
      </div>
      
      <WhatsAppDashboard />
      
      <div className="mt-8 text-gray-400 text-sm">
        <p>Para garantir a melhor experiência:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Use um número de WhatsApp exclusivo para esta integração</li>
          <li>Mantenha seu dispositivo conectado à internet</li>
          <li>Respeite os termos de uso do WhatsApp para evitar sanções</li>
          <li>Em caso de desconexão, gere um novo QR Code e escaneie novamente</li>
        </ul>
      </div>
    </div>
  );
}