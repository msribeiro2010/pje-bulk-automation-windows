const { chromium } = require('playwright');

async function testConnection() {
  try {
    console.log('🔗 Tentando conectar ao Chrome...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ Conectado ao Chrome!');
    
    const contexts = browser.contexts();
    console.log(`📄 Contextos encontrados: ${contexts.length}`);
    
    if (contexts.length > 0) {
      const context = contexts[0];
      const pages = context.pages();
      console.log(`📑 Páginas encontradas: ${pages.length}`);
      
      if (pages.length > 0) {
        const page = pages[0];
        console.log(`🌐 URL atual: ${page.url()}`);
        
        // Testar navegação para uma URL simples
        console.log('🧪 Testando navegação para Google...');
        await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
        console.log('✅ Navegação para Google bem-sucedida!');
        
        console.log('🧪 Testando navegação para PJE...');
        await page.goto('https://pje.trt15.jus.br/pjekz/pessoa-fisica', { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('✅ Navegação para PJE bem-sucedida!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testConnection();