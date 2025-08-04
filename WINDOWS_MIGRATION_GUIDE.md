# Guia de Migração para Windows - PJE Bulk KZ

## 📋 Análise de Compatibilidade

### ✅ Componentes Compatíveis com Windows

- **Node.js e TypeScript**: Totalmente compatível
- **Playwright**: Suporte nativo ao Windows
- **Express.js**: Funciona perfeitamente no Windows
- **Interface Web**: Compatível com todos os navegadores
- **Lógica de automação**: Independente de sistema operacional

### ❌ Componentes Específicos do macOS (Removidos)

- Scripts shell (.sh) - substituídos por .bat/.cmd
- Aplicativos .app do macOS
- Caminhos específicos do macOS no código
- AppleScript (.scpt)

## 🚀 Configuração no Windows

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)

   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **Git** (opcional, para clonagem)

   - Download: https://git-scm.com/download/win

3. **Google Chrome** (recomendado)
   - Download: https://www.google.com/chrome/

### Instalação

1. **Extrair/Clonar o projeto**

   ```cmd
   cd C:\caminho\para\seu\projeto
   ```

2. **Instalar dependências**

   ```cmd
   npm install
   ```

3. **Compilar o TypeScript**
   ```cmd
   npm run build
   ```

## 🔧 Scripts para Windows

### 1. Script para iniciar Chrome em modo debug

Crie o arquivo `start-chrome-debug.bat`:

```batch
@echo off
echo 🚀 Iniciando Chrome com debugging habilitado...
echo 📍 Porta CDP: 9222
echo 🌐 Acesse: http://localhost:9222 para ver as abas disponíveis
echo.
echo ⚠️  IMPORTANTE: Deixe esta janela aberta enquanto usar a automação
echo.

REM Mata processos Chrome existentes (opcional)
REM taskkill /f /im chrome.exe 2>nul

REM Inicia Chrome com debugging
start "Chrome Debug" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-debug --no-first-run --no-default-browser-check --disable-web-security --disable-features=VizDisplayCompositor

echo ✅ Chrome iniciado em modo debug
pause
```

### 2. Script para iniciar Firefox em modo debug

Crie o arquivo `start-firefox-debug.bat`:

```batch
@echo off
echo 🦊 Iniciando Firefox com debugging habilitado...
echo 📍 Porta CDP: 9223
echo.
echo ⚠️  IMPORTANTE: Deixe esta janela aberta enquanto usar a automação
echo.

REM Mata processos Firefox existentes (opcional)
REM taskkill /f /im firefox.exe 2>nul

REM Inicia Firefox com debugging
start "Firefox Debug" "C:\Program Files\Mozilla Firefox\firefox.exe" --start-debugger-server=9223 --profile %TEMP%\firefox-debug --no-remote --new-instance

echo ✅ Firefox iniciado em modo debug
pause
```

### 3. Script principal de inicialização

Crie o arquivo `start-pje-bulk.bat`:

```batch
@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        PJE BULK KZ                          ║
echo ║              Automação para Inclusão em Massa               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando PJE Bulk KZ...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
)

REM Compilar TypeScript se necessário
if not exist "dist" (
    echo 🔨 Compilando TypeScript...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ Erro ao compilar TypeScript!
        pause
        exit /b 1
    )
)

echo ✅ Dependências verificadas
echo.
echo 🌐 Iniciando servidor web em http://localhost:3000
echo 📱 A interface será aberta automaticamente no seu navegador
echo.
echo ⚠️  IMPORTANTE:
echo    1. Deixe esta janela aberta enquanto usar a aplicação
echo    2. Inicie o Chrome em modo debug antes de usar a automação
echo    3. Faça login no PJE manualmente antes de iniciar a automação
echo.
echo 🔧 Para iniciar o Chrome em modo debug, execute:
echo    start-chrome-debug.bat
echo.

REM Iniciar o servidor
start "PJE Bulk Server" /min cmd /c "npm run server"

REM Aguardar o servidor iniciar
timeout /t 3 /nobreak >nul

REM Abrir no navegador
start http://localhost:3000

echo ✅ PJE Bulk KZ iniciado com sucesso!
echo 🌐 Interface disponível em: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
```

### 4. Script de teste de produção

Crie o arquivo `test-production.bat`:

```batch
@echo off
echo 🧪 Testando ambiente de produção...
set NODE_ENV=production
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build de produção!
    pause
    exit /b 1
)
echo ✅ Build de produção concluído com sucesso!
pause
```

## 📝 Atualizações no package.json

Atualize os scripts no `package.json` para Windows:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc && xcopy /E /I /Y public dist\\public",
    "dev": "ts-node src/server.ts",
    "chrome-debug": "start-chrome-debug.bat",
    "firefox-debug": "start-firefox-debug.bat",
    "connect": "echo 🔗 Conectando à sessão existente... && ts-node src/index.ts",
    "connect-dynamic": "ts-node src/connect-dynamic.ts",
    "connect-firefox": "echo 🦊 Conectando ao Firefox... && set BROWSER_TYPE=firefox && ts-node src/index.ts",
    "manual-login": "set LOGIN_WAIT_TIME=120 && npm start",
    "manual-login-firefox": "set BROWSER_TYPE=firefox && set LOGIN_WAIT_TIME=120 && npm start",
    "server": "ts-node src/server.ts",
    "csv-help": "ts-node src/csv-cli.ts examples",
    "csv-preview": "ts-node src/csv-cli.ts preview",
    "csv-run": "ts-node src/csv-cli.ts run",
    "csv-config": "ts-node src/csv-cli.ts create-config",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 🔧 Configurações Específicas do Windows

### Caminhos do Chrome

O script detecta automaticamente o Chrome nos seguintes locais:

- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`

### Caminhos do Firefox

- `C:\Program Files\Mozilla Firefox\firefox.exe`
- `C:\Program Files (x86)\Mozilla Firefox\firefox.exe`

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Configurações do PJE Bulk KZ para Windows
PJE_URL=https://pje.trt15.jus.br/pjekz/pessoa-fisica
SERVIDORA_CPF=12345678901
PERFIL=Servidor
BROWSER_TYPE=chrome
LOGIN_WAIT_TIME=60

# Configurações específicas do Windows
CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
FIREFOX_PATH=C:\Program Files\Mozilla Firefox\firefox.exe
```

## 🚀 Como Usar no Windows

### Método 1: Interface Gráfica (Recomendado)

1. **Execute o script principal**

   ```cmd
   start-pje-bulk.bat
   ```

2. **Inicie o Chrome em modo debug** (em outra janela)

   ```cmd
   start-chrome-debug.bat
   ```

3. **Faça login no PJE** na aba do Chrome que abriu

4. **Acesse a interface** em `http://localhost:3000`

5. **Configure e execute** a automação pela interface web

### Método 2: Linha de Comando

```cmd
REM Compilar o projeto
npm run build

REM Iniciar o servidor
npm run server

REM Em outro terminal, conectar dinamicamente
npm run connect-dynamic "https://pje.trt15.jus.br/pjekz/pessoa-fisica" "12345678901" "Servidor" "Vara do Trabalho de Orlândia,1ª VT de Ribeirão Preto"
```

## 🔍 Solução de Problemas no Windows

### Chrome não conecta

```cmd
REM Finalizar todos os processos do Chrome
taskkill /f /im chrome.exe
REM Executar novamente o script de debug
start-chrome-debug.bat
```

### Erro de permissão

- Execute o Prompt de Comando como Administrador
- Verifique se o antivírus não está bloqueando os scripts

### Erro de codificação de caracteres

- Os scripts usam `chcp 65001` para UTF-8
- Certifique-se de que o terminal suporta UTF-8

### Firewall/Antivírus

- Adicione exceção para Node.js
- Adicione exceção para Chrome com debugging
- Libere as portas 3000 e 9222

## 📊 Estrutura de Arquivos no Windows

```
pje-bulk-automation-windows/
├── src/                     # Código TypeScript (compatível)
├── public/                  # Interface web (compatível)
├── data/                    # Dados e relatórios (compatível)
├── dist/                    # Código compilado (compatível)
├── node_modules/            # Dependências (compatível)
├── start-chrome-debug.bat   # Script Windows para Chrome
├── start-firefox-debug.bat  # Script Windows para Firefox
├── start-pje-bulk.bat       # Script principal Windows
├── test-production.bat      # Script de teste Windows
├── package.json             # Configuração do projeto
├── tsconfig.json            # Configuração TypeScript
├── .env                     # Variáveis de ambiente
└── WINDOWS_MIGRATION_GUIDE.md # Este guia
```

## ✅ Checklist de Migração

- [ ] Node.js instalado (versão 16+)
- [ ] Google Chrome instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto compilado (`npm run build`)
- [ ] Scripts .bat criados
- [ ] Arquivo .env configurado
- [ ] Firewall/antivírus configurado
- [ ] Teste de funcionamento realizado

## 🎯 Próximos Passos

1. **Teste a aplicação** executando `start-pje-bulk.bat`
2. **Configure o .env** com suas credenciais
3. **Teste a automação** com dados de exemplo
4. **Documente** quaisquer problemas específicos do seu ambiente

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs no terminal
2. Confirme se todas as dependências estão instaladas
3. Teste com dados de exemplo primeiro
4. Verifique se o Chrome está em modo debug

---

**Nota**: Esta aplicação foi migrada do macOS para Windows mantendo toda a funcionalidade original. A interface web e a lógica de automação permanecem idênticas.
