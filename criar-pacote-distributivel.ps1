# Script para criar pacote distributível
# Execute este script na máquina de origem para gerar pacote portável

Write-Host "🎁 Criando pacote distributível..." -ForegroundColor Green

$sourcePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$packageName = "PJE-Bulk-Automation-Portatil-$(Get-Date -Format 'yyyy-MM-dd')"
$packagePath = Join-Path $env:TEMP $packageName

# Criar estrutura do pacote
if (Test-Path $packagePath) {
    Remove-Item $packagePath -Recurse -Force
}
New-Item -ItemType Directory -Path $packagePath -Force | Out-Null

# Copiar arquivos necessários (excluir node_modules e dist para recompilar na máquina destino)
$excludeDirs = @('node_modules', 'dist', '.git')
Get-ChildItem $sourcePath | Where-Object { 
    $_.Name -notin $excludeDirs 
} | Copy-Item -Destination $packagePath -Recurse -Force

# Criar README para instalação
$readmeContent = @"
# PJE BULK AUTOMATION - PACOTE PORTÁVEL

## 📋 REQUISITOS:
- Windows 10/11
- Conexão com internet (para instalar dependências)
- Permissões de administrador

## 🚀 INSTALAÇÃO AUTOMÁTICA:

### Opção 1 - Instalador Batch (Mais Simples):
1. Clique com botão direito em 'instalar-pje-bulk.bat'
2. Escolha "Executar como administrador"
3. Aguarde a instalação automática
4. Use o atalho criado na área de trabalho

### Opção 2 - Instalador PowerShell (Mais Controle):
1. Clique com botão direito em 'instalador-portatil.ps1'
2. Escolha "Executar com PowerShell"
3. Se aparecer erro de política, execute antes:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
4. Execute novamente o instalador

## 🔧 INSTALAÇÃO MANUAL:

### Pré-requisitos (instalar manualmente se o automático falhar):
1. Node.js: https://nodejs.org/
2. Google Chrome: https://www.google.com/chrome/

### Passos manuais:
1. Extraia todos os arquivos para C:\PJE-Bulk-Automation\
2. Abra PowerShell como administrador
3. Execute: cd C:\PJE-Bulk-Automation
4. Execute: npm install
5. Execute: npm run build
6. Execute: .\criar-atalho.ps1

## 📞 SUPORTE:
- Em caso de problemas, envie prints dos erros
- Verifique se tem permissões de administrador
- Teste primeiro com o instalador automático

## 🎯 VERSÃO: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
"@

Set-Content -Path (Join-Path $packagePath "LEIA-ME-INSTALACAO.txt") -Value $readmeContent -Encoding UTF8

# Criar arquivo de configuração de exemplo
$configExample = @{
    cpf = "12345678901"
    perfil = "Perito"
    orgaos = @(
        "1ª Vara do Trabalho de São Paulo",
        "2ª Vara do Trabalho de São Paulo"
    )
    pjeUrl = "https://pje.trt15.jus.br/pjekz/pessoa-fisica?pagina=1&tamanhoPagina=10&cpf=&situacao=1"
}

$configExample | ConvertTo-Json -Depth 3 | Set-Content -Path (Join-Path $packagePath "exemplo-config.json") -Encoding UTF8

Write-Host "✅ Pacote criado em: $packagePath" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Para distribuir:" -ForegroundColor Yellow
Write-Host "   1. Comprima a pasta '$packageName' em ZIP" -ForegroundColor White
Write-Host "   2. Envie o arquivo ZIP para a outra máquina" -ForegroundColor White
Write-Host "   3. Extraia e execute 'instalar-pje-bulk.bat' como administrador" -ForegroundColor White

# Abrir pasta para o usuário
Start-Process explorer.exe -ArgumentList $packagePath

Read-Host "Pressione Enter para continuar"
