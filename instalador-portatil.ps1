# PJE Bulk Automation - Inicializador Portável
# Funciona em qualquer máquina Windows

param(
    [string]$InstallDir = "C:\PJE-Bulk-Automation"
)

Write-Host "===========================================" -ForegroundColor Green
Write-Host "    PJE BULK AUTOMATION - PORTÁVEL" -ForegroundColor Green  
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

function Write-Status {
    param($Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Cyan
}

function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Verificar se é administrador
if (-not (Test-IsAdmin)) {
    Write-Host "❌ Este script precisa ser executado como Administrador" -ForegroundColor Red
    Write-Host "👤 Clique com botão direito e escolha 'Executar como administrador'" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Status "Executando como Administrador"

# Verificar/Instalar Chocolatey
Write-Status "Verificando Chocolatey..."
try {
    choco --version | Out-Null
    Write-Status "Chocolatey já instalado"
} catch {
    Write-Status "Instalando Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

# Verificar/Instalar Node.js
Write-Status "Verificando Node.js..."
try {
    node --version | Out-Null
    Write-Status "Node.js já instalado"
} catch {
    Write-Status "Instalando Node.js..."
    choco install nodejs -y
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

# Verificar/Instalar Chrome
Write-Status "Verificando Google Chrome..."
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeFound = $true
        break
    }
}

if (-not $chromeFound) {
    Write-Status "Instalando Google Chrome..."
    choco install googlechrome -y
}

# Criar diretório de instalação
Write-Status "Preparando diretório de instalação..."
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Copiar arquivos do projeto atual
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Status "Copiando arquivos do projeto..."
Copy-Item -Path "$currentDir\*" -Destination $InstallDir -Recurse -Force

# Ir para diretório de instalação
Set-Location $InstallDir

# Instalar dependências
Write-Status "Instalando dependências npm..."
npm install

# Compilar projeto
Write-Status "Compilando projeto..."
npm run build

# Criar atalho portável na área de trabalho
Write-Status "Criando atalho na área de trabalho..."
$WScriptShell = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath("CommonDesktopDirectory")
$shortcutPath = Join-Path $desktopPath "PJE Bulk Automation.lnk"

$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$InstallDir\iniciar-pje-bulk.ps1`""
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "PJE Bulk Automation - Inclusão em massa de perfis no PJE"
$Shortcut.IconLocation = "powershell.exe,0"
$Shortcut.WindowStyle = 1
$Shortcut.Save()

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "       INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 PJE Bulk Automation instalado com sucesso!" -ForegroundColor Green
Write-Host "📁 Local: $InstallDir" -ForegroundColor Cyan
Write-Host "🔗 Atalho: Área de trabalho - 'PJE Bulk Automation'" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Para usar:" -ForegroundColor Yellow
Write-Host "   1. Clique duplo no atalho da área de trabalho" -ForegroundColor White
Write-Host "   2. Aguarde a aplicação inicializar" -ForegroundColor White
Write-Host "   3. Faça login no PJE manualmente" -ForegroundColor White
Write-Host "   4. Use a interface web em http://localhost:3000" -ForegroundColor White
Write-Host ""

$response = Read-Host "Deseja executar a aplicação agora? (s/n)"
if ($response -eq "s" -or $response -eq "S" -or $response -eq "sim") {
    Write-Status "Iniciando PJE Bulk Automation..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File `"$InstallDir\iniciar-pje-bulk.ps1`""
} else {
    Write-Host "Instalação concluída! Use o atalho quando precisar." -ForegroundColor Green
}

Read-Host "Pressione Enter para finalizar"
