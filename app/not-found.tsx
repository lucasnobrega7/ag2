export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-4'>404</h1>
        <h2 className='text-xl mb-6'>Página não encontrada</h2>
        <p className='text-muted-foreground mb-8'>
          A página que você está procurando não existe ou foi movida.
        </p>
        <a
          href='/'
          className='bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors'
        >
          Voltar para a página inicial
        </a>
      </div>
    </div>
  );
}
