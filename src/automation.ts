import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { 
  clickFirstEditButton, 
  goToServidorTab, 
  clickAddLocalizacao, 
  selectOrgaoJulgador,
  ojAlreadyAssigned 
} from './helpers';
import { AutomationController } from './automation-control';

interface ConfigData {
  cpf: string;
  perfil: string;
  orgaos: string[];
  pjeUrl: string;
}

interface ProcessResult {
  orgao: string;
  status: 'Sucesso' | 'Erro' | 'Pulado' | 'Já Incluído';
  erro?: string;
}

async function main() {
  const configFile = process.argv[2];
  
  if (!configFile || !fs.existsSync(configFile)) {
    console.error('❌ Arquivo de configuração não encontrado');
    process.exit(1);
  }
  
  const config: ConfigData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  
  // Inicializar controlador de automação
  const processId = `automation_${Date.now()}`;
  const controller = new AutomationController(processId);
  
  console.log(`🚀 Iniciando automação para CPF: ${config.cpf}`);
  console.log(`📋 Perfil: ${config.perfil}`);
  console.log(`🏛️ Órgãos a processar: ${config.orgaos.length}`);
  console.log(`🔍 DEBUG - Órgãos recebidos:`, JSON.stringify(config.orgaos, null, 2));
  console.log(`🎮 ID do processo: ${processId}`);
  console.log(`⏸️ Use a interface web para pausar/parar a automação`);
  
  // Verificar se os órgãos não estão vazios
  const orgaosValidos = config.orgaos.filter(o => o && o.trim());
  console.log(`✅ Órgãos válidos após filtro: ${orgaosValidos.length}`);
  
  if (orgaosValidos.length === 0) {
    console.log('❌ ERRO: Nenhum órgão válido encontrado!');
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Sucessos: 0`);
    console.log(`❌ Erros: 0`);
    console.log(`⏭️ Pulados: 0`);
    console.log(`🔄 Já Incluídos: 0`);
    console.log(`📋 Total: 0`);
    return;
  }
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  const results: ProcessResult[] = [];
  
  // Detectar ambiente de produção
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  try {
    
    if (isProduction) {
      // Em produção, usar Playwright em modo headless
      console.log('🌐 Ambiente de produção detectado - usando Playwright headless');
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      const context = await browser.newContext();
      page = await context.newPage();
      console.log('✅ Browser headless iniciado');
    } else {
      // Em desenvolvimento, conectar ao Chrome existente com retry
      console.log('🔗 Tentando conectar ao Chrome...');
      let retries = 3;
      
      while (retries > 0) {
        try {
          browser = await chromium.connectOverCDP('http://127.0.0.1:9222', {
            timeout: 60000 // 60 segundos de timeout
          });
          console.log('✅ Conectado ao Chrome com sucesso');
          break;
        } catch (error) {
          retries--;
          console.log(`⚠️ Falha na conexão, tentativas restantes: ${retries}`);
          if (retries === 0) {
            throw new Error(`Não foi possível conectar ao Chrome após 3 tentativas: ${error}`);
          }
          // Aguardar 2 segundos antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (!browser) {
        throw new Error('Browser não inicializado');
      }
      
      const contexts = browser.contexts();
      
      if (contexts.length === 0) {
        throw new Error('Nenhum contexto encontrado no Chrome');
      }
      
      const context = contexts[0];
      
      // Criar uma nova página para a automação
      page = await context.newPage();
      
      // Configurar User-Agent e headers para evitar bloqueios
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });
      
      console.log('🔗 Conectado ao Chrome existente');
    }
    
    // Verificar se estamos na página correta ou navegar para a URL fornecida
    const currentUrl = page.url();
    let targetDomain: string;
    
    try {
      targetDomain = new URL(config.pjeUrl).hostname;
    } catch (urlError) {
      throw new Error(`URL inválida fornecida: ${config.pjeUrl}`);
    }
    
    // Em produção, sempre navegar para a URL. Em desenvolvimento, verificar se já estamos na página correta
    if (isProduction || !currentUrl.includes(targetDomain)) {
      console.log(`🌐 Navegando para: ${config.pjeUrl}`);
      
      let navigationSuccess = false;
       const strategies = [
         { name: 'networkidle', options: { waitUntil: 'networkidle' as const, timeout: 60000 } },
         { name: 'domcontentloaded', options: { waitUntil: 'domcontentloaded' as const, timeout: 60000 } },
         { name: 'load', options: { waitUntil: 'load' as const, timeout: 60000 } },
         { name: 'simples', options: { timeout: 60000 } }
       ];
       
       for (const strategy of strategies) {
         try {
           console.log(`⏳ Tentando navegação com estratégia: ${strategy.name}`);
           await page.goto(config.pjeUrl, strategy.options);
           console.log(`✅ Navegação concluída com ${strategy.name}`);
           navigationSuccess = true;
           break;
         } catch (navError) {
           const errorMessage = navError instanceof Error ? navError.message : String(navError);
           console.log(`⚠️ Falha com ${strategy.name}:`, errorMessage);
           if (strategy.name === 'simples') {
             // Se todas as estratégias falharam, tentar uma última vez sem waitUntil
             try {
               console.log('🔄 Última tentativa: navegação sem waitUntil');
               await page.goto(config.pjeUrl);
               console.log('✅ Navegação sem waitUntil concluída');
               navigationSuccess = true;
             } catch (finalError) {
               const finalErrorMessage = finalError instanceof Error ? finalError.message : String(finalError);
               console.error('❌ Todas as estratégias de navegação falharam:', finalErrorMessage);
             }
           }
         }
       }
      
      if (!navigationSuccess) {
        throw new Error('Não foi possível navegar para a URL do PJE. Verifique se a URL está correta e se o site está acessível.');
      }
      
      await page.waitForTimeout(5000); // Aguarda a página carregar
    }
    
    console.log('✅ Página do PJE detectada');
    
    // Buscar pelo CPF
    await searchByCPF(page, config.cpf);
    
    // Aguardar resultados carregarem completamente
    console.log('⏳ Aguardando resultados da busca carregarem...');
    await page.waitForTimeout(3000);
    
    // Clicar no primeiro botão de editar
    await clickFirstEditButton(page);
    
    // Aguardar página de edição carregar completamente
    console.log('⏳ Aguardando página de edição carregar...');
    await page.waitForTimeout(5000);
    
    // Ir para a aba Servidor
    await goToServidorTab(page);
    
    // 🚀 OTIMIZAÇÃO: Verificação em lote de OJs já cadastrados com cache
    console.log('\n🔍 Verificando quais órgãos já estão cadastrados...');
    const ojsJaCadastrados = new Set<string>();
    const orgaosValidos = config.orgaos.filter(o => o && o.trim());
    const cacheVerificacao = new Map<string, boolean>();
    
    // Verificar todos os OJs de uma vez para acelerar o processo
    for (const orgao of orgaosValidos) {
      const orgaoTrimmed = orgao.trim();
      
      // 🚀 CACHE: Evita verificações duplicadas
      if (cacheVerificacao.has(orgaoTrimmed)) {
        if (cacheVerificacao.get(orgaoTrimmed)) {
          ojsJaCadastrados.add(orgaoTrimmed);
          console.log(`✓ ${orgaoTrimmed} - já cadastrado (cache)`);
          results.push({ 
            orgao: orgaoTrimmed, 
            status: 'Já Incluído', 
            erro: 'Órgão Julgador já estava incluído no perfil do servidor' 
          });
        }
        continue;
      }
      
      const jaIncluido = await ojAlreadyAssigned(page, orgaoTrimmed);
      cacheVerificacao.set(orgaoTrimmed, jaIncluido);
      
      if (jaIncluido) {
        ojsJaCadastrados.add(orgaoTrimmed);
        console.log(`✓ ${orgaoTrimmed} - já cadastrado`);
        results.push({ 
          orgao: orgaoTrimmed, 
          status: 'Já Incluído', 
          erro: 'Órgão Julgador já estava incluído no perfil do servidor' 
        });
      }
    }
    
    // Filtrar apenas os OJs que precisam ser processados
    const ojsParaProcessar = orgaosValidos.filter(o => !ojsJaCadastrados.has(o.trim()));
    
    console.log(`\n📊 ANÁLISE INICIAL:`);
    console.log(`🔄 Já cadastrados: ${ojsJaCadastrados.size}`);
    console.log(`⚡ Para processar: ${ojsParaProcessar.length}`);
    console.log(`📋 Total: ${orgaosValidos.length}`);
    
    if (ojsParaProcessar.length === 0) {
      console.log('\n🎉 Todos os órgãos já estão cadastrados! Nada a fazer.');
    } else {
      console.log(`\n🚀 Processando ${ojsParaProcessar.length} órgãos restantes...`);
    }
    
    // Processar apenas os OJs que não estão cadastrados
    for (let i = 0; i < ojsParaProcessar.length; i++) {
      // Verificar se a automação foi pausada ou parada
      await controller.waitIfPaused();
      
      if (controller.shouldStop()) {
        console.log('\n🛑 Automação interrompida pelo usuário');
        break;
      }
      
      const orgao = ojsParaProcessar[i].trim();
      
      console.log(`\n🏛️ Processando (${i + 1}/${ojsParaProcessar.length}): ${orgao}`);
      console.log(`🔄 [PROGRESSO] Executando item ${i + 1} de ${ojsParaProcessar.length}`);
      
      try {
        // 🛡️ PROTEÇÃO: Aguardar estabilização da página antes de processar
        await page.waitForTimeout(1000);
        
        // 🛡️ PROTEÇÃO: Fechar possíveis modais/alertas de erro anteriores
         try {
           const alertButtons = [
             page.locator('button:has-text("OK")'),
             page.locator('button:has-text("Fechar")'),
             page.locator('button:has-text("Cancelar")'),
             page.locator('.mat-dialog-actions button'),
             page.locator('[mat-dialog-close]')
           ];
          
          for (const alertBtn of alertButtons) {
            if (await alertBtn.count() > 0) {
              console.log('🔄 Fechando modal/alerta anterior...');
              await alertBtn.first().click();
              await page.waitForTimeout(500);
              break;
            }
          }
        } catch (alertError) {
          // Ignorar erros ao tentar fechar alertas
        }
        
        // 🛡️ PROTEÇÃO: Pressionar ESC para garantir que não há modais abertos
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // 🛡️ PROTEÇÃO CONTRA LOOP: Log detalhado do item atual
        console.log(`🎯 INICIANDO PROCESSAMENTO: "${orgao}" (Índice: ${i})`);
        
        // Clicar em Adicionar Localização
        await clickAddLocalizacao(page);
        
        // Selecionar o órgão julgador (a função já salva internamente)
        try {
          await selectOrgaoJulgador(page, orgao, config.perfil);
          console.log(`✅ Sucesso: ${orgao}`);
          console.log(`🎯 CONCLUÍDO COM SUCESSO: "${orgao}" (Índice: ${i})`);
          results.push({ orgao, status: 'Sucesso' });
          
          // 🛡️ PROTEÇÃO: Aguardar processamento após sucesso
          await page.waitForTimeout(1500);
          
        } catch (selectError) {
          console.log(`❌ Erro ao selecionar órgão ${orgao}:`, selectError);
          console.log(`🎯 ERRO NO PROCESSAMENTO: "${orgao}" (Índice: ${i})`);
          results.push({ orgao, status: 'Erro', erro: 'Órgão não encontrado ou erro na seleção' });
          
          // 🛡️ PROTEÇÃO: Tempo extra após erro para estabilizar
          await page.waitForTimeout(2000);
          
          // 🛡️ PROTEÇÃO: Tentar fechar qualquer modal de erro
           try {
             const errorModals = [
               page.locator('button:has-text("OK")'),
               page.locator('button:has-text("Fechar")'),
               page.locator('.mat-dialog-actions button')
             ];
            
            for (const modal of errorModals) {
              if (await modal.count() > 0) {
                console.log('🔄 Fechando modal de erro...');
                await modal.first().click();
                await page.waitForTimeout(1000);
                break;
              }
            }
          } catch (modalError) {
            console.log('⚠️ Não foi possível fechar modal de erro automaticamente');
          }
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${orgao}:`, error);
        console.log(`🎯 ERRO CRÍTICO NO PROCESSAMENTO: "${orgao}" (Índice: ${i})`);
        results.push({ 
          orgao, 
          status: 'Erro', 
          erro: error instanceof Error ? error.message : 'Erro desconhecido' 
        });
        
        // 🛡️ PROTEÇÃO: Tempo de recuperação após erro crítico
        await page.waitForTimeout(3000);
        
        // 🛡️ PROTEÇÃO: Tentar voltar ao estado inicial
        try {
          await page.keyboard.press('Escape');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        } catch (recoveryError) {
          console.log('⚠️ Erro na recuperação automática');
        }
      }
      
      // 🛡️ PROTEÇÃO CONTRA LOOP: Forçar continuação do loop
      console.log(`📊 FINALIZANDO ITEM ${i + 1}/${ojsParaProcessar.length}: "${orgao}"`);
      
      // 🛡️ PROTEÇÃO: Aguardar estabilização antes do próximo OJ
      if (i < ojsParaProcessar.length - 1) {
        console.log(`⏳ Aguardando estabilização antes do próximo OJ...`);
        console.log(`⏭️ PRÓXIMO ITEM: "${ojsParaProcessar[i + 1]}" (Índice: ${i + 1})`);
        await page.waitForTimeout(1500);
      }
    }
    
    // Adicionar órgãos vazios ao relatório
    for (let i = 0; i < config.orgaos.length; i++) {
      const orgao = config.orgaos[i];
      if (!orgao || !orgao.trim()) {
        console.log(`⏭️ Pulando órgão vazio na posição ${i + 1}`);
        results.push({ orgao: `Posição ${i + 1}`, status: 'Pulado' });
      }
    }
    
    // Gerar relatório
    await generateReport(results, config);
    
    // Resumo final detalhado
    const sucessos = results.filter(r => r.status === 'Sucesso').length;
    const erros = results.filter(r => r.status === 'Erro').length;
    const pulados = results.filter(r => r.status === 'Pulado').length;
    const jaIncluidos = results.filter(r => r.status === 'Já Incluído').length;
    
    console.log('\n🎯 ========================================');
    console.log('📊 RELATÓRIO FINAL DE CADASTRO DE ÓRGÃOS');
    console.log('🎯 ========================================');
    console.log(`\n📋 TOTAL DE ÓRGÃOS PROCESSADOS: ${results.length}`);
    console.log('\n📈 RESULTADOS DETALHADOS:');
    console.log(`✅ NOVOS CADASTROS REALIZADOS: ${sucessos}`);
    console.log(`🔄 JÁ EXISTIAM NO SISTEMA: ${jaIncluidos}`);
    console.log(`❌ ERROS ENCONTRADOS: ${erros}`);
    console.log(`⏭️ ÓRGÃOS PULADOS (vazios): ${pulados}`);
    
    // Calcular percentuais
    const totalValidos = sucessos + jaIncluidos + erros;
    if (totalValidos > 0) {
      const percentualSucesso = ((sucessos / totalValidos) * 100).toFixed(1);
      const percentualJaExistiam = ((jaIncluidos / totalValidos) * 100).toFixed(1);
      const percentualErros = ((erros / totalValidos) * 100).toFixed(1);
      
      console.log('\n📊 ESTATÍSTICAS:');
      console.log(`🎯 Taxa de sucesso: ${percentualSucesso}% (${sucessos}/${totalValidos})`);
      console.log(`📋 Já cadastrados: ${percentualJaExistiam}% (${jaIncluidos}/${totalValidos})`);
      console.log(`⚠️ Taxa de erro: ${percentualErros}% (${erros}/${totalValidos})`);
    }
    
    // Mostrar órgãos com erro para facilitar correção
    if (erros > 0) {
      console.log('\n❌ ÓRGÃOS COM ERRO:');
      results.filter(r => r.status === 'Erro').forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.orgao} - ${result.erro || 'Erro não especificado'}`);
      });
    }
    
    // Mostrar órgãos cadastrados com sucesso
    if (sucessos > 0) {
      console.log('\n✅ ÓRGÃOS CADASTRADOS COM SUCESSO:');
      results.filter(r => r.status === 'Sucesso').forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.orgao}`);
      });
    }
    
    // Mostrar órgãos que já existiam
    if (jaIncluidos > 0) {
      console.log('\n🔄 ÓRGÃOS QUE JÁ EXISTIAM:');
      results.filter(r => r.status === 'Já Incluído').forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.orgao}`);
      });
    }
    
    console.log('\n🎯 ========================================');
    console.log('🏁 PROCESSO DE CADASTRO FINALIZADO!');
    console.log('🎯 ========================================\n');
    
    // Retornar dados estruturados para o frontend
    const finalResult = {
      total: results.length,
      sucessos: results.filter(r => r.status === 'Sucesso').map(r => r.orgao),
      erros: results.filter(r => r.status === 'Erro').map(r => ({
        orgao: r.orgao,
        erro: r.erro || 'Erro não especificado'
      })),
      jaIncluidos: results.filter(r => r.status === 'Já Incluído').map(r => r.orgao),
      pulados: results.filter(r => r.status === 'Pulado').length,
      estatisticas: {
        percentualSucesso: totalValidos > 0 ? parseFloat(((sucessos / totalValidos) * 100).toFixed(1)) : 0,
        percentualJaExistiam: totalValidos > 0 ? parseFloat(((jaIncluidos / totalValidos) * 100).toFixed(1)) : 0,
        percentualErros: totalValidos > 0 ? parseFloat(((erros / totalValidos) * 100).toFixed(1)) : 0
      }
    };
    
    // Imprimir resultado final em JSON para o servidor capturar
    console.log('\n=== RESULTADO_FINAL_JSON ===');
    console.log(JSON.stringify(finalResult));
    console.log('=== FIM_RESULTADO_FINAL_JSON ===\n');
    
  } catch (error) {
    console.error('❌ Erro na automação:', error);
    
    // Retornar erro estruturado
    const errorResult = {
      total: 0,
      sucessos: [],
      erros: [{ orgao: 'Erro geral', erro: error instanceof Error ? error.message : 'Erro desconhecido' }],
      jaIncluidos: [],
      pulados: 0,
      estatisticas: { percentualSucesso: 0, percentualJaExistiam: 0, percentualErros: 100 }
    };
    
    console.log('\n=== RESULTADO_FINAL_JSON ===');
    console.log(JSON.stringify(errorResult));
    console.log('=== FIM_RESULTADO_FINAL_JSON ===\n');
    
    process.exit(1);
  } finally {
    // Limpar arquivo de controle
    controller.cleanup();
    
    // Fechar o browser apenas se estivermos em modo headless (produção)
    if (browser && isProduction) {
      console.log('🔒 Fechando browser...');
      try {
        await browser.close();
        console.log('✅ Browser fechado com sucesso');
      } catch (closeError) {
        console.log('⚠️ Erro ao fechar browser:', closeError);
      }
    } else if (page && !isProduction) {
      console.log('🔒 Fechando página da automação...');
      try {
        await page.close();
        console.log('✅ Página fechada com sucesso');
      } catch (closeError) {
        console.log('⚠️ Erro ao fechar página:', closeError);
      }
    }
    console.log('🏁 Automação finalizada');
  }
}

async function searchByCPF(page: Page, cpf: string) {
  // Remover formatação do CPF (pontos e traços)
  const cpfLimpo = cpf.replace(/[^0-9]/g, '');
  console.log(`🔍 Buscando por CPF: ${cpf} (limpo: ${cpfLimpo})`);
  
  // Tentar diferentes seletores para o campo de busca, priorizando campos específicos de CPF
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
  
  // Tentar clicar no botão "Procurar" primeiro, se não encontrar, usar Enter
  const searchButtonCandidates = [
    page.locator('button:has-text("Procurar")'),
    page.locator('input[type="submit"][value*="Procurar"]'),
    page.locator('button[type="submit"]'),
    page.locator('.btn:has-text("Procurar")'),
    page.locator('input[value="Procurar"]'),
    page.locator('button:has-text("Buscar")'),
    page.locator('input[type="submit"]')
  ];
  
  let searchButtonClicked = false;
  for (let i = 0; i < searchButtonCandidates.length; i++) {
    const candidate = searchButtonCandidates[i];
    const count = await candidate.count();
    console.log(`Candidato ${i + 1} para botão Procurar: ${count} elementos encontrados`);
    if (count > 0) {
      try {
        await candidate.first().waitFor({ timeout: 2000 });
        await candidate.first().click();
        console.log(`✅ Clicou no botão Procurar (candidato ${i + 1})`);
        searchButtonClicked = true;
        break;
      } catch (e) {
        console.log(`Candidato ${i + 1} para botão Procurar não está clicável`);
      }
    }
  }
  
  // Se não conseguiu clicar no botão, usar Enter como fallback
  if (!searchButtonClicked) {
    console.log('⚠️ Botão Procurar não encontrado, usando Enter como alternativa');
    await searchInput.press('Enter');
  }
  
  // Aguardar os resultados carregarem
  await page.waitForTimeout(3000);
  
  console.log('✅ Busca realizada');
}

async function generateReport(results: ProcessResult[], config: ConfigData) {
  // Configurar diretório de saída para relatórios
  const outputDir = path.join(__dirname, '..', 'data');
  
  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Gerar CSV
  const csvContent = [
    'Órgão Julgador,Status,Erro',
    ...results.map(r => `"${r.orgao}","${r.status}","${r.erro || ''}"`)
  ].join('\n');
  
  const csvPath = path.join(outputDir, 'relatorio.csv');
  fs.writeFileSync(csvPath, csvContent);
  
  // Calcular estatísticas detalhadas
  const sucessos = results.filter(r => r.status === 'Sucesso').length;
  const erros = results.filter(r => r.status === 'Erro').length;
  const pulados = results.filter(r => r.status === 'Pulado').length;
  const jaIncluidos = results.filter(r => r.status === 'Já Incluído').length;
  const totalValidos = sucessos + jaIncluidos + erros;
  
  // Gerar JSON detalhado
  const jsonReport = {
    timestamp: new Date().toISOString(),
    config: {
      cpf: config.cpf,
      perfil: config.perfil,
      totalOrgaos: config.orgaos.length
    },
    results,
    summary: {
      total: results.length,
      sucessos,
      erros,
      pulados,
      jaIncluidos,
      totalValidos,
      estatisticas: totalValidos > 0 ? {
        percentualSucesso: parseFloat(((sucessos / totalValidos) * 100).toFixed(1)),
        percentualJaExistiam: parseFloat(((jaIncluidos / totalValidos) * 100).toFixed(1)),
        percentualErros: parseFloat(((erros / totalValidos) * 100).toFixed(1))
      } : null
    },
    detalhes: {
      orgaosCadastrados: results.filter(r => r.status === 'Sucesso').map(r => r.orgao),
      orgaosJaExistiam: results.filter(r => r.status === 'Já Incluído').map(r => r.orgao),
      orgaosComErro: results.filter(r => r.status === 'Erro').map(r => ({
        orgao: r.orgao,
        erro: r.erro || 'Erro não especificado'
      })),
      orgaosPulados: results.filter(r => r.status === 'Pulado').map(r => r.orgao)
    }
  };
  
  const jsonPath = path.join(outputDir, 'relatorio.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
  
  console.log(`📄 Relatório salvo em: ${csvPath}`);
  console.log(`📄 Relatório JSON salvo em: ${jsonPath}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { main };