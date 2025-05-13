'use client';

import { AuthCheck } from '../../components/auth/auth-check';
import { useSupabase } from '../supabase-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl rounded-lg bg-white p-8 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Painel de Controle - Agentes de Conversão
            </h1>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Sair
            </button>
          </div>
          
          <div className="mb-8 rounded-md bg-blue-50 p-4">
            <h2 className="mb-2 text-lg font-medium text-blue-700">
              Bem-vindo!
            </h2>
            <p className="text-blue-700">
              {user?.email}
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Exemplos de cards de estatísticas */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Conversões</h3>
              <p className="text-3xl font-bold text-blue-600">128</p>
              <p className="mt-2 text-sm text-gray-500">Últimos 30 dias</p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Taxa de Conversão</h3>
              <p className="text-3xl font-bold text-green-600">3.2%</p>
              <p className="mt-2 text-sm text-gray-500">+0.5% desde o mês passado</p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Contas Criadas</h3>
              <p className="text-3xl font-bold text-purple-600">27</p>
              <p className="mt-2 text-sm text-gray-500">Esta semana</p>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}