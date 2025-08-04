import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { 
  clickFirstEditButton, 
  goToServidorTab, 
  clickAddLocalizacao, 
  selectOrgaoJulgador 
} from './helpers';

interface DynamicConfig {
  pjeUrl: string;
  cpf: string;
  perfil: string;
  orgaos: string[];
}

async function connectAndProcess(config: DynamicConfig) {
  console.log(`🚀 Iniciando automação dinâmica para CPF: ${config.cpf}`);
  console.log(`🌐 URL: ${config.pjeUrl}`);
  console.log(`📋 Perfil: ${config.perfil}`);
  console.log(`🏛️ Órgãos a processar: ${config.orgaos.length}`);
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    // Conectar ao Chrome existente
    browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    
    if (contexts.length === 0) {
      throw new Error('Nenhum contexto encontrado no Chrome');
    }
    
    const context = contexts[0];
    const pages = context.pages();
    
    if (pages.length === 0) {
      throw new Error('Nenhuma página encontrada');
    }
    
    page = pages[0];
    console.log('🔗 Conectado ao Chrome existente');
    
    // Navegar para a URL fornecida
    console.log(`🌐 Navegando para: ${config.pjeUrl}`);
    await page.goto(config.pjeUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    console.log('✅ Página do PJE carregada');
    
    // Buscar pelo CPF
    await searchByCPF(page, config.cpf);
    
    // Aguardar resultados e verificar se encontrou o servidor
    await page.waitForTimeout(3000);
    
    // Verificar se há resultados
    const hasResults = await page.locator('table tbody tr').count() > 0;
    if (!hasResults) {
      throw new Error('Nenhum resultado encontrado para o CPF informado');
    }
    
    console.log('✅ Servidor encontrado');
    
    // Clicar no primeiro botão de editar
    await clickFirstEditButton(page);
    
    // Ir para a aba Servidor
    await goToServidorTab(page);
    
    console.log('✅ Conectado e pronto para processar órgãos');
    console.log('🎯 Use a interface web para executar a automação completa');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    throw error;
  }
}

async function searchByCPF(page: Page, cpf: string) {
  // Remover formatação do CPF (pontos e traços)
  const cpfLimpo = cpf.replace(/[^0-9]/g, '');
  console.log(`🔍 Buscando por CPF: ${cpf} (limpo: ${cpfLimpo})`);
  
  // Tentar diferentes seletores para o campo de busca
  const searchCandidates = [
    page.locator('input[placeholder*="Digite o CPF ou nome do servidor"]'),
    page.locator('input[placeholder*="CPF"]'),
    page.locator('input[name="cpf"]'),
    page.locator('input[id="cpf"]'),
    page.locator('#cpf'),
    page.locator('input[placeholder*="nome"]'),
    page.locator('input[name="nome"]'),
    page.locator('#nome'),
    page.locator('input[type="text"]').first(),
    page.locator('.form-control').first()
  ];
  
  let searchInput = null;
  for (let i = 0; i < searchCandidates.length; i++) {
    const candidate = searchCandidates[i];
    const count = await candidate.count();
    console.log(`Candidato ${i + 1} para busca: ${count} elementos encontrados`);
    if (count > 0) {
      try {
        await candidate.first().waitFor({ timeout: 3000 });
        searchInput = candidate.first();
        console.log(`✅ Usando candidato ${i + 1} para busca`);
        break;
      } catch (e) {
        console.log(`Candidato ${i + 1} não está visível`);
      }
    }
  }
  
  if (!searchInput) {
    throw new Error('Campo de busca por CPF não foi encontrado');
  }
  
  // Limpar e digitar o CPF (sem formatação)
  await searchInput.clear();
  await searchInput.fill(cpfLimpo);
  
  // Pressionar Enter ou clicar no botão de busca
  await searchInput.press('Enter');
  
  // Aguardar os resultados carregarem
  await page.waitForTimeout(2000);
  
  console.log('✅ Busca realizada');
}

// Função para uso via linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('❌ Uso: ts-node connect-dynamic.ts <pjeUrl> <cpf> <perfil> <orgao1,orgao2,...>');
    console.log('📝 Exemplo: ts-node connect-dynamic.ts "https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1" "530.361.406-97" "Servidor" "Vara do Trabalho de Orlândia,1ª VT de Ribeirão Preto"');
    process.exit(1);
  }
  
  const [pjeUrl, cpf, perfil, orgaosStr] = args;
  const orgaos = orgaosStr.split(',').map(o => o.trim()).filter(o => o);
  
  const config: DynamicConfig = {
    pjeUrl,
    cpf,
    perfil,
    orgaos
  };
  
  await connectAndProcess(config);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { connectAndProcess, DynamicConfig };