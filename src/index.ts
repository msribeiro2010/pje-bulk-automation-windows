import { chromium, firefox } from 'playwright';
import * as fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import {
  clickFirstEditButton,
  goToServidorTab,
  clickAddLocalizacao,
  selectOrgaoJulgador,
  ojAlreadyAssigned
} from './helpers';

const BASE_URL = process.env.PJE_URL!;
const CPF = process.env.SERVIDORA_CPF!;
const PERFIL = process.env.PERFIL || 'Servidor';
const BROWSER_TYPE = process.env.BROWSER_TYPE || 'chrome'; // chrome ou firefox
const LOGIN_WAIT_TIME = parseInt(process.env.LOGIN_WAIT_TIME || '30'); // segundos para aguardar login

const OJS = [
  "Vara do Trabalho de Batatais",
  "Vara do Trabalho de Cajuru",
  "2ª Vara do Trabalho de Franca",
  "Vara do Trabalho de Ituverava",
  "Vara do Trabalho de Orlândia",
  "1ª VT de Ribeirão Preto",
  "2ª VT de Ribeirão Preto",
  "3ª VT de Ribeirão Preto",
  "4ª VT de Ribeirão Preto",
  "5ª VT de Ribeirão Preto",
  "6ª VT de Ribeirão Preto",
  "DAM - Ribeirao Preto",
  "CON1 - Ribeirão Preto",
  "CON2 - Ribeirão Preto",
  "1ª Vara do Trabalho de Sertãozinho",
  "2ª Vara do Trabalho de Sertãozinho",
  "Assessoria de Execução I de Sertãozinho, Orlândia, Batatais e Franca",
  "Assessoria de Execução II de Sertãozinho, Orlândia, Batatais e Franca",
  "EXE1 - Ribeirão Preto",
  "EXE2 - Ribeirão Preto",
  "EXE3 - Ribeirão Preto",
  "EXE4 - Ribeirão Preto",
  "LIQ1 - Ribeirão Preto",
  "LIQ2 - Ribeirão Preto",
  "DIVEX - Ribeirão Preto"
];

type ReportRow = {
  oj: string;
  status: 'OK' | 'SKIP' | 'ERRO';
  msg: string;
  screenshot?: string;
};

async function ensureOutputs() {
  await fs.mkdir('data/outputs', { recursive: true });
}

async function main() {
  console.log('🚀 Iniciando automação PJE Bulk KZ...');
  console.log('URL:', BASE_URL);
  console.log('CPF:', CPF);
  
  await ensureOutputs();
  console.log('📁 Diretório de saída criado: data/outputs');

  // Conecta ao navegador já aberto (CDP)
  const browserEngine = BROWSER_TYPE === 'firefox' ? firefox : chromium;
  const debugPort = BROWSER_TYPE === 'firefox' ? '9223' : '9222';
  
  console.log(`🔗 Conectando ao ${BROWSER_TYPE.toUpperCase()} existente...`);
  let browser, context, page;
  
  try {
    if (BROWSER_TYPE === 'firefox') {
       // Firefox usa uma abordagem diferente
       browser = await firefox.launch({ 
         headless: false,
         args: ['--start-debugger-server=9223']
       });
       context = await browser.newContext();
       page = await context.newPage();
       console.log('🦊 Firefox iniciado com debugging');
       
       // Pausa para permitir login manual
        console.log(`⏳ Aguardando ${LOGIN_WAIT_TIME} segundos para você fazer login...`);
        console.log('👤 Por favor, faça login manualmente no Firefox que acabou de abrir');
        await new Promise(resolve => setTimeout(resolve, LOGIN_WAIT_TIME * 1000));
     } else {
      // Tenta conectar ao Chrome existente na porta 9222
      browser = await chromium.connectOverCDP(`http://localhost:${debugPort}`);
      const contexts = browser.contexts();
      
      if (contexts.length > 0) {
        context = contexts[0];
        const pages = context.pages();
        
        if (pages.length > 0) {
          page = pages[0];
          console.log('✅ Conectado à aba existente do Chrome');
        } else {
          page = await context.newPage();
          console.log('📄 Nova aba criada no contexto existente');
        }
      } else {
        context = await browser.newContext();
        page = await context.newPage();
        console.log('🆕 Novo contexto criado');
      }
    }
  } catch (error) {
     console.log(`⚠️  Não foi possível conectar ao ${BROWSER_TYPE} existente, iniciando novo...`);
     browser = await browserEngine.launch({ headless: false });
     context = await browser.newContext();
     page = await context.newPage();
     console.log(`🌐 Novo ${BROWSER_TYPE} iniciado`);
     
     // Pausa para permitir login manual quando inicia novo navegador
      console.log(`⏳ Aguardando ${LOGIN_WAIT_TIME} segundos para você fazer login...`);
      console.log(`👤 Por favor, faça login manualmente no ${BROWSER_TYPE.toUpperCase()} que acabou de abrir`);
      await new Promise(resolve => setTimeout(resolve, LOGIN_WAIT_TIME * 1000));
      console.log('✅ Continuando com a automação...');
   }

  const report: ReportRow[] = [];

  // 1) Acessa a página Pessoa Física
  console.log('📄 Verificando página atual...');
  const pageUrl = page.url();
  
  // Se já estamos na página correta, não precisa navegar
  if (!pageUrl.includes('pessoa-fisica')) {
    console.log('📄 Navegando para página PJE...');
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    } catch (error: any) {
      if (error.message.includes('ERR_ABORTED')) {
        console.log('⚠️ Navegação abortada, mas continuando (página pode já estar carregada)...');
      } else {
        throw error;
      }
    }
  } else {
    console.log('✅ Já estamos na página correta');
  }

  // Verifica se há modal/tela suspensa aberta e fecha
  console.log('🔍 Verificando se há modal aberta...');
  try {
    // Primeiro, vamos verificar se há algum modal/dialog visível
    const modalSelectors = [
      '[role="dialog"]',
      '.mat-dialog-container',
      '.cdk-overlay-container [role="dialog"]',
      '.cdk-overlay-pane',
      '.mat-dialog-content',
      '.modal',
      '.popup',
      '.overlay',
      'mat-dialog-container'
    ];
    
    let modalFound = false;
    for (const selector of modalSelectors) {
      const modal = page.locator(selector);
      const count = await modal.count();
      if (count > 0) {
        console.log(`🚪 Modal detectada com seletor: ${selector} (${count} elementos)`);
        modalFound = true;
        
        // Procura por botões de fechar dentro do modal
        const closeButtons = [
          page.locator('button:has-text("Cancelar")'),
          page.locator('button:has-text("Fechar")'),
          page.locator('button:has-text("×")'),
          page.locator('button:has-text("Voltar")'),
          page.locator('button[mat-dialog-close]'),
          page.locator('[mat-dialog-close]'),
          page.locator('button[aria-label*="close"]'),
          page.locator('button[aria-label*="fechar"]'),
          page.locator('.mat-dialog-close, .modal-close, .close'),
          modal.locator('button:last-child'),
          modal.locator('button').first() // Primeiro botão do modal
        ];
        
        for (const closeBtn of closeButtons) {
          const btnCount = await closeBtn.count();
          if (btnCount > 0 && await closeBtn.first().isVisible({ timeout: 500 })) {
            console.log(`🚪 Clicando no botão de fechar modal (${btnCount} encontrados)...`);
            await closeBtn.first().click();
            await page.waitForTimeout(2000); // Aguarda modal fechar
            console.log('✅ Modal fechada');
            
            // Aguarda a página estabilizar após fechar o modal
            await page.waitForTimeout(2000);
            break;
          }
        }
        break;
      }
    }
    
    if (!modalFound) {
      console.log('ℹ️ Nenhuma modal detectada pelos seletores padrão');
      // Tenta detectar qualquer elemento que possa ser um modal
      const anyModal = page.locator('div').filter({ hasText: /servidor.*localização|localização.*visibilidade/i });
      const anyModalCount = await anyModal.count();
      if (anyModalCount > 0) {
        console.log(`🚪 Possível modal detectada por texto (${anyModalCount} elementos)`);
        // Tenta pressionar ESC para fechar
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        console.log('✅ Tentativa de fechar modal com ESC');
      }
    }
  } catch (e: any) {
    console.log('ℹ️ Erro ao verificar/fechar modal:', e?.message);
  }

  // Aguarda login manual se necessário
  const currentUrl = page.url();
  if (currentUrl.includes('sso.cloud.pje.jus.br') || currentUrl.includes('auth')) {
    console.log('🔐 Página de login detectada!');
    console.log('👤 Por favor, faça login manualmente no navegador...');
    console.log('⏳ Aguardando redirecionamento após login...');
    
    // Aguarda até ser redirecionado de volta para a página principal
    await page.waitForURL(url => !url.toString().includes('sso.cloud.pje.jus.br') && !url.toString().includes('auth'), {
      timeout: 300000 // 5 minutos para fazer login
    });
    
    console.log('✅ Login realizado com sucesso!');
    console.log('🔄 Redirecionando para página de pessoa física...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  }

  // Aguarda a página carregar completamente
  console.log('⏳ Aguardando página carregar...');
  await page.waitForTimeout(5000); // Aumentado para 5 segundos
  
  // Aguarda especificamente pelo campo de CPF aparecer
  console.log('🔍 Aguardando campo de CPF aparecer...');
  try {
    await page.waitForSelector('input[placeholder*="CPF" i], input[name*="cpf" i], input[id*="cpf" i]', { timeout: 10000 });
  } catch (e) {
    console.log('⚠️ Campo de CPF não detectado pelo waitForSelector, continuando...');
  }
  
  // Tira screenshot para debug
  await page.screenshot({ path: 'data/outputs/debug_before_cpf.png', fullPage: true });
  
  // 2) Item 2 - Digitar CPF
  console.log('Preenchendo CPF:', CPF);
  
  // Estratégia melhorada: primeiro tenta os seletores mais específicos
  const cpfFieldCandidates = [
    page.locator('input[placeholder*="CPF" i]').first(),
    page.locator('input[name*="cpf" i]').first(),
    page.locator('input[id*="cpf" i]').first(),
    page.getByLabel(/cpf/i),
    page.getByPlaceholder(/cpf/i),
    page.getByRole('textbox', { name: /cpf/i }),
    page.locator('section:has-text("2") input[type="text"]').first(),
    page.locator('input[type="text"]:visible').first()
  ];
  
  let filled = false;
  for (let i = 0; i < cpfFieldCandidates.length; i++) {
    const candidate = cpfFieldCandidates[i];
    try {
      console.log(`Tentando candidato ${i + 1} para CPF...`);
      await candidate.waitFor({ state: 'visible', timeout: 3000 });
      await candidate.fill(CPF, { timeout: 3000 });
      filled = true;
      console.log(`✅ CPF preenchido com sucesso (candidato ${i + 1})`);
      break;
    } catch (e: any) {
       console.log(`Candidato ${i + 1} falhou:`, e?.message || e);
    }
  }
  
  if (!filled) {
    // Debug: listar todos os inputs disponíveis
    console.log('🔍 Debug: Listando todos os inputs disponíveis...');
    const allInputs = await page.locator('input').all();
    for (let i = 0; i < Math.min(allInputs.length, 15); i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const visible = await input.isVisible();
      const value = await input.inputValue();
      console.log(`Input ${i + 1}: type="${type}" placeholder="${placeholder}" name="${name}" id="${id}" visible=${visible} value="${value}"`);
    }
    throw new Error('Não encontrei o campo de CPF no Item 2.');
  }

  // Procura e clica no botão de busca/procurar se existir
  console.log('🔍 Procurando botão de busca...');
  const searchButtons = [
    page.getByRole('button', { name: /procurar|buscar|pesquisar/i }),
    page.locator('button:has-text("Procurar")'),
    page.locator('button:has-text("Buscar")'),
    page.locator('button[type="submit"]'),
    page.locator('input[type="submit"]')
  ];
  
  for (const searchBtn of searchButtons) {
    if (await searchBtn.count() > 0 && await searchBtn.first().isVisible({ timeout: 1000 })) {
      console.log('🔍 Clicando no botão de busca...');
      await searchBtn.first().click();
      break;
    }
  }

  // Aguarda resultados aparecerem
  console.log('⏳ Aguardando resultados da busca...');
  await page.waitForTimeout(3000);
  
  // Verifica se há resultados
  const resultSelectors = [
    'table tbody tr',
    '.result-row',
    '[role="row"]',
    '.pessoa-result',
    '.search-result'
  ];
  
  let hasResults = false;
  for (const selector of resultSelectors) {
    const results = page.locator(selector);
    const count = await results.count();
    if (count > 0) {
      console.log(`✅ Encontrados ${count} resultados com seletor: ${selector}`);
      hasResults = true;
      break;
    }
  }
  
  if (!hasResults) {
    console.log('⚠️ Nenhum resultado encontrado para o CPF:', CPF);
    // Tira screenshot para debug
    await page.screenshot({ path: 'data/outputs/no_results_debug.png', fullPage: true });
    throw new Error(`Nenhum resultado encontrado para o CPF: ${CPF}`);
  }

  // Aguarda aparecer resultado com nome + ícone de lápis e clica em Editar
  await clickFirstEditButton(page);

  // 3) Aba "Servidor"
  await goToServidorTab(page);

  // 4) Para cada OJ da lista
  console.log(`Processando ${OJS.length} Órgãos Julgadores...`);
  for (let i = 0; i < OJS.length; i++) {
    const oj = OJS[i];
    console.log(`\n[${i + 1}/${OJS.length}] Processando: ${oj}`);
    
    try {
      // Se já existir, SKIP
      if (await ojAlreadyAssigned(page, oj)) {
        console.log(`✓ OJ já atribuído: ${oj}`);
        report.push({ oj, status: 'SKIP', msg: 'OJ já atribuído' });
        continue;
      }

      // Adicionar Localização/Visibilidade
      console.log('Clicando em Adicionar Localização...');
      await clickAddLocalizacao(page);

      // Selecionar Órgão Julgador e salvar
      console.log('Selecionando Órgão Julgador...');
      await selectOrgaoJulgador(page, oj, PERFIL);

      // Confirma que apareceu na grade
      console.log('Verificando se OJ foi incluído...');
      const exists = await ojAlreadyAssigned(page, oj);
      if (!exists) throw new Error('Após salvar, o OJ não apareceu na grade/lista.');

      // Evidência
      const shotPath = path.join('data/outputs', `ok_${oj}.png`).replace(/\s+/g, '_');
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`✓ Sucesso: ${oj}`);

      report.push({ oj, status: 'OK', msg: 'Localização/Visibilidade incluída', screenshot: shotPath });
    } catch (e: any) {
      console.log(`✗ Erro ao processar ${oj}:`, e?.message);
      const shotPath = path.join('data/outputs', `err_${oj}.png`).replace(/\s+/g, '_');
      await page.screenshot({ path: shotPath, fullPage: true });
      report.push({ oj, status: 'ERRO', msg: e?.message ?? 'Falha ao incluir OJ', screenshot: shotPath });
    }
  }

  // 5) Gera relatório CSV
  console.log('\n📊 Gerando relatório...');
  const csv = [
    'oj,status,msg,screenshot',
    ...report.map(r => [r.oj, r.status, JSON.stringify(r.msg), r.screenshot ?? ''].join(','))
  ].join('\n');
  await fs.writeFile('data/outputs/relatorio.csv', csv, 'utf8');
  
  // Estatísticas finais
  const stats = {
    total: report.length,
    ok: report.filter(r => r.status === 'OK').length,
    skip: report.filter(r => r.status === 'SKIP').length,
    erro: report.filter(r => r.status === 'ERRO').length
  };
  
  console.log('\n📈 Estatísticas finais:');
  console.log(`Total: ${stats.total}`);
  console.log(`✅ Sucesso: ${stats.ok}`);
  console.log(`⏭️  Pulados: ${stats.skip}`);
  console.log(`❌ Erros: ${stats.erro}`);

  await browser.close();
  console.log('\n✨ Finalizado! Relatório salvo em: data/outputs/relatorio.csv');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
