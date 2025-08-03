import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Interface para os resultados da automação
interface AutomationResult {
  total: number;
  sucessos: string[];
  erros: string[];
  pulados: number;
}

// Rota principal - serve a interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para executar a automação
app.post('/api/run-automation', async (req, res) => {
  try {
    const { cpf, perfil, orgaos, pjeUrl } = req.body;
    
    console.log('🔍 DEBUG - Dados recebidos na API:');
    console.log('- CPF:', cpf);
    console.log('- Perfil:', perfil);
    console.log('- PJE URL:', pjeUrl);
    console.log('- Órgãos (tipo):', typeof orgaos);
    console.log('- Órgãos (é array):', Array.isArray(orgaos));
    console.log('- Órgãos (conteúdo):', JSON.stringify(orgaos, null, 2));
    
    if (!cpf || !perfil || !orgaos || !Array.isArray(orgaos) || !pjeUrl) {
      console.log('❌ Validação falhou - dados inválidos');
      return res.status(400).json({ error: 'Dados inválidos - CPF, perfil, órgãos e URL do PJE são obrigatórios' });
    }
    
    // Verificar se os órgãos não estão vazios
    const orgaosValidos = orgaos.filter(o => o && o.trim());
    console.log('✅ Órgãos válidos após filtro:', orgaosValidos.length);
    
    if (orgaosValidos.length === 0) {
      console.log('❌ ERRO: Nenhum órgão válido encontrado!');
      return res.json({
        total: 0,
        sucessos: [],
        erros: ['Nenhum órgão válido foi fornecido'],
        pulados: 0
      });
    }
    
    console.log('🚀 Iniciando automação com:', { cpf, perfil, orgaos: orgaos.length, pjeUrl });
    
    // Criar arquivo de configuração temporário
    const configFile = path.join('/tmp', `config-${Date.now()}.json`);
    const config = {
      cpf,
      perfil,
      orgaos: orgaosValidos,
      pjeUrl
    };
    
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    
    // Executar automação
    const result = await runAutomation(configFile);
    
    // Limpar arquivo temporário
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
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
    // Usar arquivo JS compilado em produção
     const automationScript = process.env.NODE_ENV === 'production' 
       ? path.join(__dirname, '..', 'src', 'automation.js')
       : path.join(__dirname, '..', 'src', 'automation.ts');
     
     const command = process.env.NODE_ENV === 'production' ? 'node' : 'ts-node';
    
    const child = spawn(command, [automationScript, configFile], {
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
      if (code === 0) {
        try {
          // Tentar ler o relatório gerado
          const reportPath = path.join('/tmp', 'relatorio.csv');
          if (fs.existsSync(reportPath)) {
            const result = parseReport(reportPath);
            resolve(result);
          } else {
            // Fallback: analisar output
            const result = parseOutput(output);
            resolve(result);
          }
        } catch (error) {
          reject(new Error('Erro ao processar resultados: ' + error));
        }
      } else {
        reject(new Error(`Automação falhou com código ${code}: ${errorOutput}`));
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log('📱 Acesse a interface web para usar a automação');
});