const express = require('express');
const { normalizeOrgaoName } = require('./dist/src/helpers');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulação de IA para normalização inteligente
class AIOrganNormalizer {
  constructor() {
    // Base de conhecimento simulada de padrões comuns
    this.patterns = {
      'vara': {
        prefixes: ['1ª', '2ª', '3ª', '4ª', '5ª', 'Primeira', 'Segunda', 'Terceira'],
        types: ['Cível', 'Criminal', 'Trabalho', 'Federal', 'Estadual'],
        locations: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador']
      },
      'tribunal': {
        types: ['TJ', 'TRT', 'TRF', 'TST', 'STJ', 'STF'],
        regions: ['1ª Região', '2ª Região', '3ª Região']
      }
    };
    
    // Correções inteligentes baseadas em padrões
    this.smartCorrections = {
      'itapetininga': 'Itapetininga',
      'sao paulo': 'São Paulo',
      'rio de janeiro': 'Rio De Janeiro',
      'brasilia': 'Brasília'
    };
  }
  
  // Análise inteligente do contexto
  analyzeContext(text) {
    const analysis = {
      type: null,
      location: null,
      number: null,
      specialty: null,
      confidence: 0
    };
    
    const lowerText = text.toLowerCase();
    
    // Detectar tipo de órgão
    if (lowerText.includes('vara')) {
      analysis.type = 'vara';
      analysis.confidence += 0.3;
    } else if (lowerText.includes('tribunal')) {
      analysis.type = 'tribunal';
      analysis.confidence += 0.3;
    }
    
    // Detectar especialidade
    if (lowerText.includes('trabalho')) {
      analysis.specialty = 'Trabalho';
      analysis.confidence += 0.2;
    } else if (lowerText.includes('civel')) {
      analysis.specialty = 'Cível';
      analysis.confidence += 0.2;
    }
    
    // Detectar localização
    for (const [key, value] of Object.entries(this.smartCorrections)) {
      if (lowerText.includes(key)) {
        analysis.location = value;
        analysis.confidence += 0.3;
        break;
      }
    }
    
    // Detectar numeração
    const numberMatch = text.match(/(\d+)[ªº°]?/);
    if (numberMatch) {
      analysis.number = numberMatch[1] + 'ª';
      analysis.confidence += 0.2;
    }
    
    return analysis;
  }
  
  // Normalização inteligente com IA
  intelligentNormalize(text) {
    // Primeiro, usar a normalização básica
    const basicNormalized = normalizeOrgaoName(text);
    
    // Depois, aplicar inteligência artificial
    const analysis = this.analyzeContext(text);
    
    let aiEnhanced = basicNormalized;
    
    // Aplicar correções inteligentes baseadas na análise
    if (analysis.confidence > 0.5) {
      // Reconstruir o nome com base na análise
      let parts = [];
      
      if (analysis.number) {
        parts.push(analysis.number);
      }
      
      if (analysis.type === 'vara') {
        parts.push('Vara');
      }
      
      if (analysis.specialty) {
        parts.push('Do', analysis.specialty);
      }
      
      if (analysis.location) {
        parts.push('De', analysis.location);
      }
      
      if (parts.length > 0) {
        aiEnhanced = parts.join(' ');
      }
    }
    
    return {
      original: text,
      basicNormalized,
      aiEnhanced,
      analysis,
      confidence: analysis.confidence,
      recommendation: analysis.confidence > 0.7 ? 'high' : analysis.confidence > 0.4 ? 'medium' : 'low'
    };
  }
}

const aiNormalizer = new AIOrganNormalizer();

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware para capturar rotas não encontradas e retornar JSON
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        console.log('⚠️  Tentativa de retornar HTML para API:', req.url);
        return res.status(404).json({ error: 'Rota não encontrada', path: req.url });
      }
      return originalSend.call(this, data);
    };
  }
  next();
});

// Rota principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Organ Normalizer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .form-group { margin: 20px 0; }
            input, button { padding: 10px; margin: 5px; }
            input[type="text"] { width: 300px; }
            button { background: #007bff; color: white; border: none; cursor: pointer; }
            .result { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px; }
            .confidence { font-weight: bold; }
            .high { color: green; }
            .medium { color: orange; }
            .low { color: red; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 AI-Powered Organ Name Normalizer</h1>
            <p>Esta ferramenta usa inteligência artificial para normalizar nomes de órgãos julgadores.</p>
            
            <div class="form-group">
                <input type="text" id="orgaoName" placeholder="Digite o nome do órgão" value="Vara do Trabalho ITAPETININGA">
                <button onclick="normalizeWithAI()">Normalizar com IA</button>
                <button onclick="normalizeBasic()">Normalizar Básico</button>
            </div>
            
            <div id="result"></div>
        </div>
        
        <script>
            async function normalizeWithAI() {
                const name = document.getElementById('orgaoName').value;
                try {
                    const response = await fetch('/api/ai-normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome: name })
                    });
                    const data = await response.json();
                    displayResult(data, 'AI');
                } catch (error) {
                    document.getElementById('result').innerHTML = '<div class="result">Erro: ' + error.message + '</div>';
                }
            }
            
            async function normalizeBasic() {
                const name = document.getElementById('orgaoName').value;
                try {
                    const response = await fetch('/api/normalize-orgao', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome: name })
                    });
                    const data = await response.json();
                    displayResult(data, 'Basic');
                } catch (error) {
                    document.getElementById('result').innerHTML = '<div class="result">Erro: ' + error.message + '</div>';
                }
            }
            
            function displayResult(data, type) {
                let html = '<div class="result">';
                html += '<h3>Resultado da Normalização ' + type + '</h3>';
                
                if (type === 'AI') {
                    html += '<p><strong>Original:</strong> ' + data.original + '</p>';
                    html += '<p><strong>Normalização Básica:</strong> ' + data.basicNormalized + '</p>';
                    html += '<p><strong>🤖 IA Aprimorada:</strong> ' + data.aiEnhanced + '</p>';
                    html += '<p><strong>Confiança:</strong> <span class="confidence ' + data.recommendation + '">' + (data.confidence * 100).toFixed(1) + '% (' + data.recommendation + ')</span></p>';
                    
                    if (data.analysis) {
                        html += '<h4>Análise da IA:</h4>';
                        html += '<ul>';
                        if (data.analysis.type) html += '<li>Tipo: ' + data.analysis.type + '</li>';
                        if (data.analysis.specialty) html += '<li>Especialidade: ' + data.analysis.specialty + '</li>';
                        if (data.analysis.location) html += '<li>Localização: ' + data.analysis.location + '</li>';
                        if (data.analysis.number) html += '<li>Numeração: ' + data.analysis.number + '</li>';
                        html += '</ul>';
                    }
                } else {
                    html += '<p><strong>Original:</strong> ' + data.original + '</p>';
                    html += '<p><strong>Normalizado:</strong> ' + data.normalizado + '</p>';
                }
                
                html += '</div>';
                document.getElementById('result').innerHTML = html;
            }
        </script>
    </body>
    </html>
  `);
});

// API de normalização básica
app.post('/api/normalize-orgao', (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ error: 'Nome do órgão é obrigatório' });
    }
    
    const nomeNormalizado = normalizeOrgaoName(nome);
    
    res.json({
      original: nome,
      normalizado: nomeNormalizado
    });
    
  } catch (error) {
    console.error('Erro ao normalizar nome do órgão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API de normalização com IA
app.post('/api/ai-normalize', (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ error: 'Nome do órgão é obrigatório' });
    }
    
    const result = aiNormalizer.intelligentNormalize(nome);
    
    res.json(result);
    
  } catch (error) {
    console.error('Erro ao normalizar com IA:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor AI funcionando!', timestamp: new Date().toISOString() });
});

// Rotas de automação para compatibilidade com a interface
app.get('/api/automation/status', (req, res) => {
  res.json({ status: 'idle', message: 'Nenhuma automação ativa' });
});

app.post('/api/automation/pause', (req, res) => {
  res.json({ message: 'Funcionalidade não disponível no servidor AI', status: 'not_available' });
});

app.post('/api/automation/resume', (req, res) => {
  res.json({ message: 'Funcionalidade não disponível no servidor AI', status: 'not_available' });
});

app.post('/api/automation/stop', (req, res) => {
  res.json({ message: 'Funcionalidade não disponível no servidor AI', status: 'not_available' });
});

app.get('/api/chrome-status', (req, res) => {
  res.json({ running: false, message: 'Chrome não configurado no servidor AI' });
});

app.post('/api/start-chrome', (req, res) => {
  res.json({ 
    success: false, 
    message: 'Funcionalidade de iniciar Chrome não disponível no servidor AI',
    error: 'Esta funcionalidade requer o servidor principal (server.ts)',
    status: 'not_available'
  });
});

// Middleware para capturar rotas não encontradas
app.use((req, res, next) => {
  // Se chegou até aqui, a rota não foi encontrada
  if (req.url.startsWith('/api/') || req.url.startsWith('/@vite/')) {
    res.status(404).json({ error: 'Rota não encontrada', path: req.url });
  } else {
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`🤖 Servidor AI rodando em http://localhost:${PORT}`);
  console.log('🧠 Normalização inteligente com IA disponível!');
  console.log('📊 Acesse a interface para testar a normalização');
});

module.exports = app;