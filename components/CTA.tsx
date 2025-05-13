'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star } from 'lucide-react';

export function CTA() {
  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto px-4 md:px-6'>
        <motion.div
          className='relative max-w-5xl mx-auto rounded-2xl overflow-hidden'
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Gradient Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-secondary/30' />

          {/* Glass Effect Overlay */}
          <div className='absolute inset-0 backdrop-blur-sm' />

          <div className='relative p-8 md:p-12 lg:p-16 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-6'>
              Transforme seu atendimento hoje mesmo
            </h2>
            <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8'>
              Comece gratuitamente e escale conforme seu negócio cresce. Sem compromissos, sem
              complexidade.
            </p>

            <div className='flex flex-col sm:flex-row justify-center gap-4 mb-12'>
              <Link
                href='/signup'
                className='bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors'
              >
                Começar gratuitamente
              </Link>
              <Link
                href='/pricing'
                className='bg-background hover:bg-muted border px-6 py-3 rounded-md font-medium transition-colors'
              >
                Ver planos e preços
              </Link>
            </div>

            <div className='flex flex-col md:flex-row gap-6 justify-center'>
              {[
                {
                  name: 'Ana Silva',
                  company: 'Tech Solutions',
                  quote: 'Aumentamos as conversões em 45% com os agentes de IA personalizados.',
                },
                {
                  name: 'Ricardo Mendes',
                  company: 'E-commerce Brasil',
                  quote: 'Nosso tempo de resposta caiu de horas para segundos. Inacreditável!',
                },
                {
                  name: 'Carolina Santos',
                  company: 'Agência Digital',
                  quote: 'Os clientes não percebem que estão falando com um assistente de IA.',
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className='bg-background/70 backdrop-blur-sm border rounded-lg p-6 flex-1'
                >
                  <div className='flex items-center gap-1 text-amber-500 mb-3'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill='currentColor' />
                    ))}
                  </div>
                  <p className='text-sm mb-4'>&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className='text-sm'>
                    <p className='font-medium'>{testimonial.name}</p>
                    <p className='text-muted-foreground'>{testimonial.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
