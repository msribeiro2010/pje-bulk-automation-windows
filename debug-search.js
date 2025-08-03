// Debug específico para busca de opções
const { chromium } = require('playwright');

async function debugSearch() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navegar para a página de teste (substitua pela URL real)
    console.log('🌐 Navegando para a página...');
    await page.goto('https://pje.trt15.jus.br/pjekz/pessoa-fisica');
    
    // Aguardar a página carregar
    await page.waitForTimeout(3000);
    
    console.log('🔍 Procurando por campos de seleção...');
    
    // Listar todos os mat-select na página
    const matSelects = await page.locator('mat-select').all();
    console.log(`📋 Encontrados ${matSelects.length} mat-select na página`);
    
    for (let i = 0; i < matSelects.length; i++) {
      const select = matSelects[i];
      const placeholder = await select.getAttribute('placeholder');
      const ariaLabel = await select.getAttribute('aria-label');
      const isVisible = await select.isVisible();
      console.log(`  ${i + 1}. placeholder="${placeholder}" aria-label="${ariaLabel}" visível=${isVisible}`);
    }
    
    // Procurar especificamente por campo de Órgão Julgador
    const orgaoField = page.locator('mat-select[placeholder*="Órgão Julgador" i]');
    const orgaoCount = await orgaoField.count();
    
    if (orgaoCount > 0) {
      console.log('\n✅ Campo de Órgão Julgador encontrado!');
      
      // Clicar no campo
      await orgaoField.first().click();
      console.log('🖱️ Clicou no campo de Órgão Julgador');
      
      // Aguardar opções aparecerem
      await page.waitForTimeout(2000);
      
      // Listar todas as opções disponíveis
      const options = await page.locator('mat-option, [role="option"]').all();
      console.log(`\n📋 Opções disponíveis (${options.length}):`);
      
      for (let i = 0; i < Math.min(options.length, 20); i++) {
        const option = options[i];
        const text = await option.textContent();
        const isVisible = await option.isVisible();
        console.log(`  ${i + 1}. "${text?.trim()}" (visível: ${isVisible})`);
      }
      
      // Testar busca específica por "CAPÃO BONITO"
      const testNames = [
        'CAPÃO BONITO',
        'Capão Bonito',
        'capão bonito',
        'Vara do Trabalho CAPÃO BONITO',
        'Vara do Trabalho de CAPÃO BONITO',
        'Vara do Trabalho Capão Bonito'
      ];
      
      console.log('\n🔍 Testando busca por variações de CAPÃO BONITO:');
      
      for (const testName of testNames) {
        const found = await page.locator('mat-option, [role="option"]')
          .filter({ hasText: new RegExp(testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
          .count();
        
        console.log(`  "${testName}": ${found > 0 ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'} (${found} matches)`);
      }
      
    } else {
      console.log('❌ Campo de Órgão Julgador não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    console.log('\n⏸️ Pausando por 30 segundos para inspeção manual...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

debugSearch().catch(console.error);