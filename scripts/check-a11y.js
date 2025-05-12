// Simulação de check de acessibilidade sem dependência do axe-core/puppeteer
const puppeteer = require('puppeteer');

(async () => {
  // Iniciar o navegador
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navegar para o site local
  await page.goto('http://localhost:3000/');

  // Verificação manual de elementos de acessibilidade comuns
  const accessibilityChecks = await page.evaluate(() => {
    const checks = [];

    // Verificar imagens sem alt
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      checks.push({
        id: 'image-alt',
        help: 'Imagens devem ter texto alternativo',
        impact: 'serious',
        nodes: imagesWithoutAlt.length,
      });
    }

    // Verificar contraste de cores (simplificado)
    const lowContrastElements = [];
    document.querySelectorAll('h1, h2, h3, p, span, a').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.color === style.backgroundColor) {
        lowContrastElements.push(el.tagName);
      }
    });

    if (lowContrastElements.length > 0) {
      checks.push({
        id: 'color-contrast',
        help: 'Elementos devem ter contraste adequado',
        impact: 'serious',
        nodes: lowContrastElements.length,
      });
    }

    // Verificar links sem texto
    const emptyLinks = document.querySelectorAll('a:empty, a[href="#"]');
    if (emptyLinks.length > 0) {
      checks.push({
        id: 'link-name',
        help: 'Links devem ter texto descritivo',
        impact: 'serious',
        nodes: emptyLinks.length,
      });
    }

    return checks;
  });

  // Exibir resultados
  console.log('Violations found:', accessibilityChecks.length);

  if (accessibilityChecks.length > 0) {
    console.log('\nProblemas de acessibilidade encontrados:');
    accessibilityChecks.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.id}: ${violation.help}`);
      console.log(`   Impacto: ${violation.impact}`);
      console.log(`   Elementos afetados: ${violation.nodes}`);
    });
  } else {
    console.log('✅ Nenhum problema de acessibilidade encontrado!');
  }

  // Fechar o navegador
  await browser.close();
})().catch(err => {
  console.error('Erro ao executar a análise:', err);
  process.exit(1);
});
