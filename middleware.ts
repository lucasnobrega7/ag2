import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// Este middleware garante que estamos usando a nova App Router
export function middleware(request: NextRequest) {
  // Apenas para garantir que o middleware está sendo executado
  const response = NextResponse.next()
  return response
}
 
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto:
     * - Arquivos de metadados (robots.txt, favicon.ico, etc.)
     * - Rotas com extensão de arquivo (arquivos)
     * - Rotas API (/api)
     * - Arquivos estáticos (_next)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}