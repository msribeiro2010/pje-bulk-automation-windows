import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { importOrgaosFromCSV } from './csv-importer';
import { AutomationController } from './automation-control';
import { normalizeOrgaoName } from './helpers';

const app = express();
const PORT = 3000;

// Middleware já configurado acima

// Configuração do multer para upload de arquivos
const upload = multer({
  dest: path.join(__dirname, '../data/uploads/'),
  fileFilter: (req, file, cb) => {
    // Aceitar apenas arquivos CSV
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Rotas serão definidas após o middleware

// Middleware
app.use(express.json());

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Static files middleware será movido para depois das rotas da API

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Interface para os resultados da automação
interface AutomationResult {
  total: number;
  sucessos: string[];
  erros: Array<string | { orgao: string; erro: string }>;
  jaIncluidos?: string[];
  pulados: number;
  estatisticas?: {
    percentualSucesso: number;
    percentualJaExistiam: number;
    percentualErros: number;
  };
}

// Rota principal - serve a interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rotas de controle da automação
app.post('/api/automation/pause', (req, res) => {
  try {
    const success = AutomationController.pause();
    if (success) {
      res.json({ message: 'Automação pausada com sucesso', status: 'paused' });
    } else {
      res.status(404).json({ error: 'Nenhuma automação ativa encontrada' });
    }
  } catch (error) {
    console.error('Erro ao pausar automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/automation/resume', (req, res) => {
  try {
    const success = AutomationController.resume();
    if (success) {
      res.json({ message: 'Automação retomada com sucesso', status: 'running' });
    } else {
      res.status(404).json({ error: 'Nenhuma automação pausada encontrada' });
    }
  } catch (error) {
    console.error('Erro ao retomar automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/automation/stop', (req, res) => {
  try {
    const success = AutomationController.stop();
    if (success) {
      res.json({ message: 'Automação parada com sucesso', status: 'stopped' });
    } else {
      res.status(404).json({ error: 'Nenhuma automação ativa encontrada' });
    }
  } catch (error) {
    console.error('Erro ao parar automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/automation/status', (req, res) => {
  try {
    const status = AutomationController.getStatus();
    if (status) {
      res.json(status);
    } else {
      res.json({ status: 'idle', message: 'Nenhuma automação ativa' });
    }
  } catch (error) {
    console.error('Erro ao obter status da automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar status do Chrome
app.get('/api/chrome-status', async (req, res) => {
  try {
    // Verificar se o Chrome está rodando na porta 9222
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://127.0.0.1:9222/json/version', {
      timeout: 5000
    });
    
    console.log('Chrome status check - Response OK:', response.ok, 'Status:', response.status);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Chrome version data:', data);
        return res.status(200).json({ 
          running: true, 
          version: data,
          debugUrl: 'http://localhost:9222'
        });
      } else {
        // Resposta não é JSON, mas Chrome está rodando
        console.log('Chrome running but not JSON response');
        return res.status(200).json({ 
          running: true,
          debugUrl: 'http://localhost:9222'
        });
      }
    } else {
      console.log('Chrome not responding - Status:', response.status);
      return res.status(200).json({ running: false });
    }
  } catch (error) {
    console.error('Error checking Chrome status:', error);
    return res.status(200).json({ running: false });
  }
});

// Rota para iniciar o Chrome em modo debug
app.post('/api/start-chrome', async (req, res) => {
  try {
    // Caminho para o script de inicialização do Chrome
    const scriptPath = path.join(__dirname, '../start-chrome-debug.sh');
    
    // Verificar se o script existe
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ 
        success: false, 
        error: 'Script start-chrome-debug.sh não encontrado' 
      });
    }

    // Executar o script
    const child = spawn('bash', [scriptPath], {
      detached: true,
      stdio: 'ignore'
    });

    // Desanexar o processo para que continue rodando
    child.unref();

    // Aguardar um pouco para verificar se o processo iniciou corretamente
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar se o Chrome está rodando na porta 9222
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://127.0.0.1:9222/json/version', {
        timeout: 3000
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Resposta JSON válida
          const data = await response.json();
          return res.status(200).json({ 
            success: true, 
            message: 'Chrome iniciado com sucesso em modo debug',
            debugUrl: 'http://localhost:9222',
            version: data
          });
        } else {
          // Resposta não é JSON, mas Chrome está rodando
          return res.status(200).json({ 
            success: true, 
            message: 'Chrome iniciado com sucesso em modo debug',
            debugUrl: 'http://localhost:9222'
          });
        }
      } else {
        throw new Error('Chrome não respondeu na porta 9222');
      }
    } catch (fetchError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Chrome foi iniciado mas não está respondendo na porta 9222. Aguarde alguns segundos e tente novamente.' 
      });
    }

  } catch (error) {
    console.error('Erro ao iniciar Chrome:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
});

// Rota para upload e processamento de CSV
app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo CSV foi enviado' });
    }

    const { cpf, perfil, pjeUrl, column = 'Orgao Julgador', hasHeader = 'true' } = req.body;
    
    if (!cpf || !perfil || !pjeUrl) {
      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'CPF, perfil e URL do PJE são obrigatórios' });
    }

    console.log('📁 Processando upload de CSV:', {
      filename: req.file.originalname,
      size: req.file.size,
      cpf,
      perfil,
      pjeUrl,
      column,
      hasHeader
    });

    // Importar órgãos do CSV
    const importResult = importOrgaosFromCSV(
      req.file.path,
      parseInt(column) || 0,
      hasHeader === 'true' || hasHeader === true
    );

    console.log(`📊 Importados ${importResult.orgaos.length} órgãos do CSV`);

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    // Criar dados para automação
    const tempData = {
      cpf,
      perfil,
      orgaos: importResult.orgaos,
      pjeUrl
    };
    
    const tempFile = path.join(__dirname, '../data/temp-config.json');
    fs.writeFileSync(tempFile, JSON.stringify(tempData, null, 2));
    
    // Executar a automação
    const result = await runAutomation(tempFile);
    
    // Limpar arquivo temporário
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    res.json({
      ...result,
      csvInfo: {
        filename: req.file.originalname,
        totalImported: importResult.orgaos.length,
        totalLinhas: importResult.totalLinhas,
        linhasValidas: importResult.linhasValidas,
        linhasIgnoradas: importResult.linhasIgnoradas
      }
    });
    
  } catch (error) {
    console.error('Erro no upload/processamento de CSV:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
});

// Rota para normalizar nome de órgão julgador
app.post('/api/normalize-orgao', (req, res) => {
  console.log('🔍 Rota /api/normalize-orgao chamada');
  console.log('📝 Body recebido:', req.body);
  
  try {
    const { nome } = req.body;
    
    if (!nome || typeof nome !== 'string') {
      console.log('❌ Nome inválido:', nome);
      return res.status(400).json({ error: 'Nome do órgão é obrigatório' });
    }
    
    console.log('✅ Normalizando:', nome);
    const nomeNormalizado = normalizeOrgaoName(nome);
    console.log('✅ Resultado:', nomeNormalizado);
    
    res.json({
      original: nome,
      normalizado: nomeNormalizado
    });
    
  } catch (error) {
    console.error('❌ Erro ao normalizar nome do órgão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

console.log('📋 Rota /api/normalize-orgao registrada');

// Rota de teste simples
app.post('/api/test-route', (req, res) => {
  console.log('🧪 Rota de teste chamada');
  res.json({ message: 'Rota de teste funcionando', body: req.body });
});

console.log('📋 Rota /api/test-route registrada');

// Rota para executar a automação
app.post('/api/run-automation', async (req, res) => {
  try {
    const { cpf, perfil, orgaos, pjeUrl } = req.body;
    
    if (!cpf || !perfil || !orgaos || !Array.isArray(orgaos) || !pjeUrl) {
      return res.status(400).json({ error: 'Dados inválidos - CPF, perfil, órgãos e URL do PJE são obrigatórios' });
    }
    
    console.log('🚀 Iniciando automação com:', { cpf, perfil, orgaos: orgaos.length, pjeUrl });
    
    // Criar arquivo temporário com os dados
    const tempData = {
      cpf,
      perfil,
      orgaos,
      pjeUrl
    };
    
    const tempFile = path.join(__dirname, '../data/temp-config.json');
    fs.writeFileSync(tempFile, JSON.stringify(tempData, null, 2));
    
    // Executar a automação
    const result = await runAutomation(tempFile);
    
    // Limpar arquivo temporário
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Erro na automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para executar a automação
function runAutomation(configFile: string): Promise<AutomationResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('ts-node', ['src/automation.ts', configFile], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(text);
    });
    
    child.on('close', (code) => {
      try {
        // Tentar extrair resultado JSON estruturado do output
        const jsonMatch = output.match(/=== RESULTADO_FINAL_JSON ===\n([\s\S]*?)\n=== FIM_RESULTADO_FINAL_JSON ===/); 
        
        if (jsonMatch && jsonMatch[1]) {
          try {
            const result = JSON.parse(jsonMatch[1].trim());
            console.log('✅ Resultado estruturado capturado:', result);
            resolve(result);
            return;
          } catch (parseError) {
            console.log('⚠️ Erro ao fazer parse do JSON estruturado:', parseError);
          }
        }
        
        // Fallback: tentar ler o relatório gerado
        const reportPath = path.join(__dirname, '../data/relatorio.json');
        if (fs.existsSync(reportPath)) {
          const reportContent = fs.readFileSync(reportPath, 'utf-8');
          const reportData = JSON.parse(reportContent);
          
          const result = {
            total: reportData.summary.total,
            sucessos: reportData.detalhes.orgaosCadastrados || [],
            erros: reportData.detalhes.orgaosComErro || [],
            jaIncluidos: reportData.detalhes.orgaosJaExistiam || [],
            pulados: reportData.summary.pulados || 0,
            estatisticas: reportData.summary.estatisticas
          };
          
          console.log('✅ Resultado do relatório JSON capturado:', result);
          resolve(result);
          return;
        }
        
        // Fallback final: analisar output de texto
        const result = parseOutput(output);
        console.log('✅ Resultado do output de texto capturado:', result);
        resolve(result);
        
      } catch (error) {
        console.error('❌ Erro ao processar resultados:', error);
        reject(new Error('Erro ao processar resultados: ' + error));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error('Erro ao executar automação: ' + error.message));
    });
  });
}

// Função para analisar o relatório CSV
function parseReport(reportPath: string): AutomationResult {
  const content = fs.readFileSync(reportPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const sucessos: string[] = [];
  const erros: string[] = [];
  let pulados = 0;
  
  // Pular cabeçalho
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const [orgao, status] = line.split(',').map(s => s.trim().replace(/"/g, ''));
    
    if (status === 'Sucesso') {
      sucessos.push(orgao);
    } else if (status === 'Pulado') {
      pulados++;
    } else {
      erros.push(orgao);
    }
  }
  
  return {
    total: lines.length - 1,
    sucessos,
    erros,
    pulados
  };
}

// Função para analisar output quando não há relatório
function parseOutput(output: string): AutomationResult {
  const sucessos: string[] = [];
  const erros: string[] = [];
  let pulados = 0;
  
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('✓ Sucesso:')) {
      const orgao = line.replace('✓ Sucesso:', '').trim();
      sucessos.push(orgao);
    } else if (line.includes('✗ Erro ao processar')) {
      const match = line.match(/✗ Erro ao processar (.+?):/); 
      if (match) {
        erros.push(match[1]);
      }
    } else if (line.includes('⏭️ Pulando')) {
      pulados++;
    }
  }
  
  return {
    total: sucessos.length + erros.length + pulados,
    sucessos,
    erros,
    pulados
  };
}

// Middleware de arquivos estáticos temporariamente removido para teste
// app.use(express.static(path.join(__dirname, '../public')));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log('📱 Acesse a interface web para usar a automação');
  
  // Loop infinito para manter o processo ativo
  setInterval(() => {
    // Apenas mantém o processo vivo
  }, 60000); // A cada 60 segundos
});

// Export para Vercel (serverless)
// export default app;