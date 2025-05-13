'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  const [typedText, setTypedText] = useState('');
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const examples = useMemo(
    () => [
      'Crie um chatbot para atendimento ao cliente',
      'Automatize respostas no WhatsApp',
      'Desenvolva um assistente para seu site',
      'Treine IA com o conhecimento da sua empresa',
    ],
    []
  );

  useEffect(() => {
    const examplesList = examples; // Use a local copy inside the effect
    const currentExample = examplesList[currentExampleIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(currentExample.substring(0, typedText.length + 1));
        setTypingSpeed(100);

        if (typedText.length === currentExample.length) {
          setIsDeleting(true);
          setTypingSpeed(50);
          setTimeout(() => {
            setTypingSpeed(30);
          }, 1000);
        }
      } else {
        setTypedText(currentExample.substring(0, typedText.length - 1));

        if (typedText.length === 0) {
          setIsDeleting(false);
          setCurrentExampleIndex((currentExampleIndex + 1) % examplesList.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, currentExampleIndex, isDeleting, typingSpeed, examples]);

  return (
    <section className='section-platform pt-36 md:pt-40 overflow-hidden bg-gradient-platform'>
      <div className='container-platform'>
        <div className='max-w-4xl mx-auto text-center mb-16'>
          <motion.h1
            className='heading-hero mb-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            API de inteligência artificial para transformar seu negócio
          </motion.h1>

          <motion.div
            className='body-large text-muted-foreground max-w-3xl mx-auto mb-10'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p>
              Nossa plataforma oferece modelos de IA estado-da-arte e APIs para criar aplicações que
              compreendem e geram texto, imagens e código.
            </p>
          </motion.div>

          <motion.div
            className='h-16 flex items-center justify-center mb-10'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className='bg-accent/50 border border-border rounded-lg px-6 py-3 inline-block'>
              <p className='text-lg'>
                <span>{typedText}</span>
                <span className='animate-blink'>|</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            className='flex flex-col sm:flex-row items-center justify-center gap-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href='/cadastro' className='btn-primary w-full sm:w-auto'>
              Começar gratuitamente
            </Link>
            <Link href='/docs/inicio-rapido' className='btn-outline w-full sm:w-auto'>
              Documentação
            </Link>
          </motion.div>
        </div>

        {/* Code Example Card */}
        <motion.div
          className='max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className='bg-secondary text-secondary-foreground p-2 flex items-center'>
            <div className='flex space-x-1.5 pl-1'>
              <div className='w-3 h-3 rounded-full bg-destructive/80'></div>
              <div className='w-3 h-3 rounded-full bg-amber-400/80'></div>
              <div className='w-3 h-3 rounded-full bg-green-400/80'></div>
            </div>
            <div className='ml-4 text-xs font-medium text-secondary-foreground/70'>
              Exemplo de API
            </div>
          </div>
          <div className='bg-[#1E1E1E] p-4 overflow-x-auto text-sm font-mono text-gray-300'>
            <pre className='whitespace-pre'>
              <code>{`import requests
import json

# Define a API URL e key
url = "https://api.agentesdeconversao.com.br/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {AGENTES_API_KEY}"
}

# Crie sua requisição
data = {
    "model": "agentes-3",
    "messages": [
        {"role": "system", "content": "Você é um assistente útil especializado em vendas."},
        {"role": "user", "content": "Como posso aumentar a conversão do meu e-commerce?"}
    ]
}

# Envie a requisição
response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json())
`}</code>
            </pre>
          </div>
        </motion.div>

        {/* API Stats & Partners */}
        <motion.div
          className='mt-20 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className='text-sm text-muted-foreground mb-4'>
            Utilizado por empresas inovadoras em todo o Brasil
          </p>
          <div className='flex flex-wrap justify-center items-center gap-8 md:gap-12'>
            {['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D', 'Empresa E'].map(
              (company, index) => (
                <div
                  key={index}
                  className='grayscale opacity-70 hover:opacity-100 transition-opacity'
                >
                  <div className='h-8'>
                    <span className='text-sm font-medium'>{company}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
