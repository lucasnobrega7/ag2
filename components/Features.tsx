'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  MessageSquare,
  Zap,
  BarChart3,
  Puzzle, // Substituido PuzzlePiece por Puzzle
  Lock,
  Globe,
} from 'lucide-react';

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: <MessageSquare className='w-6 h-6 text-primary' />,
      title: 'Assistentes Inteligentes',
      description: 'Desenvolva chatbots treinados com o conhecimento específico da sua empresa',
    },
    {
      icon: <Zap className='w-6 h-6 text-primary' />,
      title: 'Automatização',
      description: 'Automatize respostas e processos de atendimento sem perder a personalização',
    },
    {
      icon: <BarChart3 className='w-6 h-6 text-primary' />,
      title: 'Análise de Dados',
      description: 'Extraia insights valiosos das conversas e interações com seus clientes',
    },
    {
      icon: <Puzzle className='w-6 h-6 text-primary' />,
      title: 'Integrações',
      description: 'Conecte com WhatsApp, Telegram, Site, Email e outras plataformas',
    },
    {
      icon: <Lock className='w-6 h-6 text-primary' />,
      title: 'Dados Seguros',
      description: 'Seus dados permanecem protegidos com criptografia e controles de acesso',
    },
    {
      icon: <Globe className='w-6 h-6 text-primary' />,
      title: 'Multiplataforma',
      description: 'Funciona em qualquer dispositivo, sistema operacional ou navegador',
    },
  ];

  const integrations = [
    'WhatsApp',
    'Telegram',
    'Instagram',
    'Facebook',
    'Google Business',
    'Email',
    'SMS',
    'API Customizada',
  ];

  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Recursos poderosos para seu negócio
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Tudo o que você precisa para transformar seu atendimento e vendas com inteligência
            artificial
          </p>
        </div>

        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className='bg-card border rounded-lg p-6 hover:shadow-md transition-shadow'
              variants={itemVariants}
            >
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
                {feature.icon}
              </div>
              <h3 className='text-xl font-medium mb-2'>{feature.title}</h3>
              <p className='text-muted-foreground'>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className='mt-32 mb-16'
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className='relative max-w-5xl mx-auto'>
            <div className='aspect-video rounded-lg overflow-hidden border shadow-xl bg-card'>
              <div className='w-full h-full bg-muted flex items-center justify-center'>
                <span className='text-xl text-muted-foreground'>[Interface da plataforma]</span>
              </div>
            </div>

            <div className='absolute -bottom-6 -right-6 -left-6 bg-gradient-to-t from-background via-background to-transparent h-24 pointer-events-none' />
          </div>
        </motion.div>

        <motion.div
          className='text-center mt-24'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h3 className='text-2xl font-bold mb-6'>Integra-se com suas plataformas favoritas</h3>

          <div className='flex flex-wrap justify-center gap-4'>
            {integrations.map((platform, index) => (
              <div key={index} className='bg-card border px-4 py-2 rounded-md text-sm font-medium'>
                {platform}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
