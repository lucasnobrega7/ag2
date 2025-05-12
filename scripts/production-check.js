const fs = require('fs');
const path = require('path');

// Lista de arquivos e recursos críticos para verificar
const criticalResources = [
  // Fontes
  'public/fonts/soehne-web-buch.woff2',
  'public/fonts/soehne-web-kraftig.woff2',
  'public/fonts/soehne-web-halbfett.woff2',

  // CSS processado
  'styles/output.css',

  // Imagens e recursos estáticos
  'public/images/logo.svg',

  // Arquivos de configuração
  'next.config.js',
  'tailwind.config.js',
];

// Verificar arquivos
console.log('Verificando recursos críticos para produção...');
let allResourcesPresent = true;

criticalResources.forEach(resource => {
  const resourcePath = path.join(process.cwd(), resource);
  const exists = fs.existsSync(resourcePath);

  if (exists) {
    console.log(`✅ ${resource} - OK`);
  } else {
    console.log(`❌ ${resource} - AUSENTE`);
    allResourcesPresent = false;
  }
});

// Verificar classe customizadas no CSS
const cssFilePath = path.join(process.cwd(), 'styles/output.css');
const cssContent = fs.readFileSync(cssFilePath, 'utf8');

const requiredCssClasses = [
  '.container-platform',
  '.header-platform',
  '.btn-primary',
  '.nav-link',
  '.header-scrolled',
];

console.log('\nVerificando classes CSS críticas...');
let allClassesPresent = true;

requiredCssClasses.forEach(cssClass => {
  if (cssContent.includes(cssClass)) {
    console.log(`✅ ${cssClass} - Presente no CSS`);
  } else {
    console.log(`❌ ${cssClass} - AUSENTE no CSS`);
    allClassesPresent = false;
  }
});

// Resultado final
console.log('\nResultado da verificação:');
if (allResourcesPresent && allClassesPresent) {
  console.log('✅ Todos os recursos verificados estão presentes e prontos para produção.');
  process.exit(0);
} else {
  console.log('❌ Alguns recursos estão ausentes. Resolva os problemas antes de fazer o deploy.');
  process.exit(1);
}
