const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Definir os tamanhos de tela a serem testados
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1366, height: 768, name: 'laptop' },
  { width: 1920, height: 1080, name: 'desktop' },
];

// Criar pasta para screenshots se não existir
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

(async () => {
  // Iniciar o navegador
  const browser = await puppeteer.launch();

  for (const viewport of viewports) {
    const page = await browser.newPage();

    // Configurar o tamanho da viewport
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
    });

    console.log(`\nTeste em ${viewport.name} (${viewport.width}x${viewport.height})`);

    // Navegar para o site local
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

    // Tirar screenshot
    const screenshotPath = path.join(screenshotsDir, `${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Screenshot salvo: ${screenshotPath}`);

    // Verificar overflow horizontal (um problema comum de responsividade)
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    if (hasHorizontalOverflow) {
      console.log(`❌ PROBLEMA: Overflow horizontal detectado em ${viewport.name}`);
    } else {
      console.log(`✅ Sem overflow horizontal em ${viewport.name}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nTestes de responsividade concluídos!');
})().catch(err => {
  console.error('Erro ao testar responsividade:', err);
  process.exit(1);
});
