# Script para criar executável standalone usando pkg
# Requer instalação do pkg: npm install -g pkg

Write-Host "🔨 Criando executável standalone..." -ForegroundColor Green

# Verificar se pkg está instalado
try {
    pkg --version | Out-Null
    Write-Host "✅ pkg encontrado" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando pkg globalmente..." -ForegroundColor Yellow
    npm install -g pkg
}

# Criar package.json específico para executável
$pkgConfig = @{
    name = "pje-bulk-automation"
    version = "1.0.0"
    description = "PJE Bulk Automation Standalone"
    main = "dist/src/server.js"
    bin = @{
        "pje-bulk" = "dist/src/server.js"
    }
    pkg = @{
        targets = @("node18-win-x64")
        outputPath = "standalone"
        assets = @(
            "dist/public/**/*",
            "dist/src/**/*"
        )
    }
}

$pkgConfig | ConvertTo-Json -Depth 4 | Set-Content -Path "package-standalone.json" -Encoding UTF8

# Compilar projeto primeiro
Write-Host "🔨 Compilando projeto..." -ForegroundColor Cyan
npm run build

# Criar executável
Write-Host "📦 Criando executável Windows..." -ForegroundColor Cyan
pkg package-standalone.json --target node18-win-x64 --output standalone/pje-bulk-automation.exe

if (Test-Path "standalone/pje-bulk-automation.exe") {
    Write-Host "✅ Executável criado com sucesso!" -ForegroundColor Green
    Write-Host "📁 Local: standalone/pje-bulk-automation.exe" -ForegroundColor Cyan
    
    # Criar script de inicialização para o executável
    $startScript = @"
@echo off
title PJE Bulk Automation
echo 🚀 Iniciando PJE Bulk Automation...
echo 🌐 Interface: http://localhost:3000
echo 📱 Aguarde o navegador abrir automaticamente...
echo.
start http://localhost:3000
pje-bulk-automation.exe
pause
"@
    
    Set-Content -Path "standalone/iniciar.bat" -Value $startScript -Encoding ASCII
    
    Write-Host "📋 Para usar o executável:" -ForegroundColor Yellow
    Write-Host "   1. Copie a pasta 'standalone' para qualquer máquina" -ForegroundColor White
    Write-Host "   2. Execute 'iniciar.bat'" -ForegroundColor White
    Write-Host "   3. O servidor iniciará na porta 3000" -ForegroundColor White
    
} else {
    Write-Host "❌ Falha ao criar executável" -ForegroundColor Red
}

Read-Host "Pressione Enter para continuar"
