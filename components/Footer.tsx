import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, Youtube, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Plataforma',
      links: [
        { href: '/produtos/api', label: 'API' },
        { href: '/produtos/assistentes', label: 'Assistentes' },
        { href: '/produtos/integracao', label: 'Integrações' },
        { href: '/produtos/precos', label: 'Preços' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { href: '/empresa/sobre', label: 'Sobre' },
        { href: '/empresa/carreiras', label: 'Carreiras' },
        { href: '/empresa/blog', label: 'Blog' },
        { href: '/empresa/contato', label: 'Contato' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { href: '/recursos/documentacao', label: 'Documentação' },
        { href: '/recursos/guias', label: 'Guias' },
        { href: '/recursos/tutoriais', label: 'Tutoriais' },
        { href: '/recursos/status', label: 'Status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/legal/privacidade', label: 'Privacidade' },
        { href: '/legal/termos', label: 'Termos' },
        { href: '/legal/cookies', label: 'Cookies' },
        { href: '/legal/licencas', label: 'Licenças' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Twitter size={20} />, href: 'https://twitter.com/agentesconversao', label: 'Twitter' },
    {
      icon: <Linkedin size={20} />,
      href: 'https://linkedin.com/company/agentesconversao',
      label: 'LinkedIn',
    },
    { icon: <Github size={20} />, href: 'https://github.com/agentesconversao', label: 'GitHub' },
    {
      icon: <Youtube size={20} />,
      href: 'https://youtube.com/c/agentesconversao',
      label: 'YouTube',
    },
    {
      icon: <Instagram size={20} />,
      href: 'https://instagram.com/agentesconversao',
      label: 'Instagram',
    },
  ];

  return (
    <footer className='bg-muted py-12 md:py-16'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 mb-12'>
          <div className='col-span-2 md:col-span-1'>
            <Link href='/' className='flex items-center space-x-2 mb-6'>
              <Image
                src='/images/logo.svg'
                alt='Agentes de Conversão'
                width={32}
                height={32}
                className='w-8 h-8'
              />
              <span className='font-medium'>Agentes de Conversão</span>
            </Link>

            <p className='text-sm text-muted-foreground mb-6'>
              Transformando interações digitais com inteligência artificial conversacional.
            </p>

            <div className='flex space-x-4'>
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((group, i) => (
            <div key={i}>
              <h3 className='font-medium mb-4'>{group.title}</h3>
              <ul className='space-y-3'>
                {group.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className='text-sm text-muted-foreground hover:text-foreground transition-colors'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='pt-8 border-t border-border'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-sm text-muted-foreground mb-4 md:mb-0'>
              &copy; {currentYear} Agentes de Conversão. Todos os direitos reservados.
            </p>

            <div className='flex flex-wrap justify-center gap-4 text-sm text-muted-foreground'>
              <Link href='/legal/privacidade' className='hover:text-foreground transition-colors'>
                Política de Privacidade
              </Link>
              <Link href='/legal/termos' className='hover:text-foreground transition-colors'>
                Termos de Uso
              </Link>
              <Link href='/legal/cookies' className='hover:text-foreground transition-colors'>
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
