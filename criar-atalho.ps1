# Script para criar atalho do PJE Bulk na area de trabalho

Write-Host "Criando atalho para PJE Bulk Automation..." -ForegroundColor Green

# Obter caminhos
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$psFile = Join-Path $scriptDir "iniciar-pje-bulk.ps1"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "PJE Bulk Automation.lnk"

# Verificar se o arquivo PowerShell existe
if (-not (Test-Path $psFile)) {
    Write-Host "ERRO: Arquivo iniciar-pje-bulk.ps1 nao encontrado!" -ForegroundColor Red
    Write-Host "Procurando em: $psFile" -ForegroundColor Yellow
    pause
    exit 1
}

# Criar objeto WScript.Shell
$WScriptShell = New-Object -ComObject WScript.Shell

# Criar atalho
$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$psFile`""
$Shortcut.WorkingDirectory = $scriptDir
$Shortcut.Description = "PJE Bulk Automation - Inclusao em massa de perfis no PJE"
$Shortcut.IconLocation = "powershell.exe,0"
$Shortcut.WindowStyle = 1
$Shortcut.Save()

Write-Host "SUCESSO: Atalho criado!" -ForegroundColor Green
Write-Host "Local: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para usar:" -ForegroundColor Yellow
Write-Host "   1. Clique duplo no atalho 'PJE Bulk Automation' na area de trabalho" -ForegroundColor White
Write-Host "   2. Aguarde a aplicacao inicializar" -ForegroundColor White
Write-Host "   3. Faca login no PJE na aba do Chrome" -ForegroundColor White
Write-Host "   4. Use a interface web que abrira automaticamente" -ForegroundColor White
Write-Host ""

# Perguntar se quer executar agora
$response = Read-Host "Deseja executar a aplicacao agora? (s/n)"
if ($response -eq "s" -or $response -eq "S" -or $response -eq "sim") {
    Write-Host "Iniciando PJE Bulk Automation..." -ForegroundColor Green
    Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File `"$psFile`""
} else {
    Write-Host "Atalho criado! Use-o quando precisar." -ForegroundColor Green
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
