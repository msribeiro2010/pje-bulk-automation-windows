# PJE Bulk Automation - Inicializador PowerShell
# Versao: 1.0

Write-Host "===========================================" -ForegroundColor Green
Write-Host "    PJE BULK AUTOMATION - WINDOWS" -ForegroundColor Green  
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Funcao para exibir status
function Write-Status {
    param($Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Cyan
}

# Ir para diretorio do script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Status "Verificando Node.js..."
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "Instale de: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Status "Verificando dependencias..."
if (-not (Test-Path "node_modules")) {
    Write-Status "Instalando dependencias..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao instalar dependencias!" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

Write-Status "Compilando projeto..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha na compilacao!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Status "Procurando Google Chrome..."
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if (-not $chromePath) {
    Write-Host "ERRO: Google Chrome nao encontrado!" -ForegroundColor Red
    Write-Host "Instale de: https://www.google.com/chrome/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "Chrome encontrado: $chromePath" -ForegroundColor Green

Write-Status "Iniciando Chrome em modo debug..."
$chromeArgs = @(
    "--remote-debugging-port=9222",
    "--user-data-dir=$env:TEMP\chrome-pje-bulk",
    "--disable-web-security",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
)

Start-Process -FilePath $chromePath -ArgumentList $chromeArgs

Write-Status "Aguardando Chrome inicializar (10 segundos)..."
Start-Sleep -Seconds 10

Write-Status "Verificando Chrome debug..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9222/json/version" -TimeoutSec 5
    Write-Host "Chrome debug ativo!" -ForegroundColor Green
} catch {
    Write-Host "AVISO: Chrome pode nao ter iniciado corretamente" -ForegroundColor Yellow
    Write-Host "Continuando mesmo assim..." -ForegroundColor Yellow
}

Write-Status "Abrindo interface web..."
Start-Process "http://localhost:3000"

Write-Status "Iniciando servidor da aplicacao..."
Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "    APLICACAO INICIADA!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Interface Web: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Chrome Debug: http://localhost:9222" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- Mantenha esta janela aberta" -ForegroundColor White
Write-Host "- Faca login no PJE na aba do Chrome" -ForegroundColor White
Write-Host "- Use a interface web para automacao" -ForegroundColor White
Write-Host ""
Write-Host "Para parar: Pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
try {
    node "dist\src\server.js"
} catch {
    Write-Host "Servidor finalizado." -ForegroundColor Yellow
}

Read-Host "Pressione Enter para sair"
