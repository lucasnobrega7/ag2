// Script para converter fontes OTF para WOFF2 e prepará-las para deploy
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapeamento de fontes originais para destino
const fontMapping = [
  {
    source: 'TestSöhne-Buch.otf',
    destination: 'soehne-web-buch.woff2',
    weight: 400,
  },
  {
    source: 'TestSöhne-Kräftig.otf',
    destination: 'soehne-web-kraftig.woff2',
    weight: 500,
  },
  {
    source: 'TestSöhne-Halbfett.otf',
    destination: 'soehne-web-halbfett.woff2',
    weight: 600,
  },
];

// Verifique se as ferramentas necessárias estão instaladas
try {
  console.log('Verificando se fonttools está instalado...');

  // Tenta executar fonttools para ver se está instalado
  try {
    execSync('which fonttools');
    console.log('✅ fonttools está instalado.');
  } catch (e) {
    console.log('❌ fonttools não encontrado. Você precisa instalá-lo com:');
    console.log('   pip install fonttools brotli');
    process.exit(1);
  }

  // Caminhos
  const originalFontsDir = path.join(__dirname, 'public', 'fonts', 'original');
  const outputDir = path.join(__dirname, 'public', 'fonts');

  // Verifique se os diretórios existem
  if (!fs.existsSync(originalFontsDir)) {
    console.error(`❌ Diretório de fontes originais não encontrado: ${originalFontsDir}`);
    process.exit(1);
  }

  console.log('🔄 Convertendo fontes...');

  // Processa cada fonte
  for (const font of fontMapping) {
    const sourcePath = path.join(originalFontsDir, font.source);
    const destPath = path.join(outputDir, font.destination);

    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Arquivo de fonte não encontrado: ${sourcePath}`);
      continue;
    }

    try {
      // Comando para converter o arquivo
      const command = `fonttools ttLib.woff2 compress "${sourcePath}" -o "${destPath}"`;
      console.log(`Executando: ${command}`);
      execSync(command);
      console.log(`✅ Convertido: ${font.source} → ${font.destination}`);
    } catch (error) {
      console.error(`❌ Erro ao converter fonte ${font.source}:`, error.message);
    }
  }

  console.log('\n✅ Processo de conversão de fontes concluído!');
  console.log('As fontes estão prontas para o deploy.\n');
} catch (error) {
  console.error('❌ Erro durante o processo:', error.message);
  process.exit(1);
}
