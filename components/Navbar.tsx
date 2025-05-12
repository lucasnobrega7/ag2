'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn('header-platform', isScrolled ? 'header-scrolled' : 'header-transparent')}
    >
      <div className='container-platform py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2'>
            <Image
              src='/images/logo.svg'
              alt='Agentes de Conversão'
              width={32}
              height={32}
              className='w-8 h-8'
            />
            <span className='font-medium text-lg'>Agentes de Conversão</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-6'>
            <nav className='flex items-center space-x-6'>
              <NavLink href='/docs/api' label='API' />
              <NavLink href='/docs/guias' label='Guias' />
              <NavLink href='/exemplos' label='Exemplos' />
              <NavLink href='/precos' label='Preços' />
              <NavLink href='/documentacao' label='Documentação' />
            </nav>

            {/* Search Button */}
            <button
              className='flex items-center text-muted-foreground hover:text-foreground transition-colors'
              aria-label='Pesquisar'
            >
              <Search size={18} />
            </button>

            {/* Auth Buttons */}
            <div className='flex items-center space-x-3 pl-3 border-l border-border'>
              <Link href='/login' className='nav-link'>
                Entrar
              </Link>
              <Link href='/cadastro' className='btn-primary'>
                Cadastrar
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='block md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-background/95 backdrop-blur-md border-t border-border'>
          <div className='container-platform py-4 space-y-4'>
            <nav className='flex flex-col space-y-3'>
              <MobileNavLink href='/docs/api' label='API' />
              <MobileNavLink href='/docs/guias' label='Guias' />
              <MobileNavLink href='/exemplos' label='Exemplos' />
              <MobileNavLink href='/precos' label='Preços' />
              <MobileNavLink href='/documentacao' label='Documentação' />
            </nav>

            <div className='flex flex-col space-y-3 pt-4 border-t border-border'>
              <Link href='/login' className='nav-link'>
                Entrar
              </Link>
              <Link href='/cadastro' className='btn-primary w-full flex justify-center'>
                Cadastrar
              </Link>

              {/* Mobile Search */}
              <div className='relative mt-3'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Search size={16} className='text-muted-foreground' />
                </div>
                <input
                  type='search'
                  placeholder='Pesquisar...'
                  className='w-full py-2 pl-10 pr-4 bg-accent/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className='nav-link'>
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className='block py-2 text-foreground font-medium'>
      {label}
    </Link>
  );
}
