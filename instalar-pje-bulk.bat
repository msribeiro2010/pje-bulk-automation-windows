@echo off
chcp 65001 >nul
title PJE Bulk Automation - Instalador Automático
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                   PJE BULK AUTOMATION                        ║
echo ║                  INSTALADOR AUTOMÁTICO                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Verificando sistema e instalando dependências...
echo.

REM Verificar se está executando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Este instalador precisa ser executado como Administrador
    echo 👤 Clique com botão direito e escolha "Executar como administrador"
    pause
    exit /b 1
)

echo ✅ Executando como Administrador
echo.

REM Verificar se Chocolatey está instalado
where choco >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando Chocolatey (gerenciador de pacotes)...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorlevel% neq 0 (
        echo ❌ Falha ao instalar Chocolatey
        pause
        exit /b 1
    )
    echo ✅ Chocolatey instalado com sucesso
) else (
    echo ✅ Chocolatey já instalado
)

REM Atualizar PATH para reconhecer choco
call refreshenv

REM Verificar e instalar Node.js
echo 📦 Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando Node.js...
    choco install nodejs -y
    if %errorlevel% neq 0 (
        echo ❌ Falha ao instalar Node.js
        pause
        exit /b 1
    )
    echo ✅ Node.js instalado com sucesso
) else (
    echo ✅ Node.js já instalado
)

REM Verificar e instalar Google Chrome
echo 📦 Verificando Google Chrome...
if not exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    if not exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
        echo 📦 Instalando Google Chrome...
        choco install googlechrome -y
        if %errorlevel% neq 0 (
            echo ❌ Falha ao instalar Google Chrome
            pause
            exit /b 1
        )
        echo ✅ Google Chrome instalado com sucesso
    ) else (
        echo ✅ Google Chrome já instalado (x86)
    )
) else (
    echo ✅ Google Chrome já instalado
)

REM Criar diretório de instalação
set INSTALL_DIR=C:\PJE-Bulk-Automation
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo ✅ Diretório de instalação criado: %INSTALL_DIR%
)

REM Copiar arquivos do projeto
echo 📁 Copiando arquivos do projeto...
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%\" >nul
if %errorlevel% neq 0 (
    echo ❌ Falha ao copiar arquivos
    pause
    exit /b 1
)
echo ✅ Arquivos copiados com sucesso

REM Atualizar PATH e instalar dependências
cd /d "%INSTALL_DIR%"
call refreshenv

echo 📦 Instalando dependências npm...
npm install
if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar dependências npm
    pause
    exit /b 1
)
echo ✅ Dependências npm instaladas

echo 🔨 Compilando projeto...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Falha ao compilar projeto
    pause
    exit /b 1
)
echo ✅ Projeto compilado com sucesso

REM Criar atalho na área de trabalho para todos os usuários
echo 🔗 Criando atalho na área de trabalho...
powershell -Command "& {$WScriptShell = New-Object -ComObject WScript.Shell; $Shortcut = $WScriptShell.CreateShortcut('%PUBLIC%\Desktop\PJE Bulk Automation.lnk'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-ExecutionPolicy Bypass -File \"%INSTALL_DIR%\iniciar-pje-bulk.ps1\"'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'PJE Bulk Automation - Inclusão em massa de perfis no PJE'; $Shortcut.IconLocation = 'powershell.exe,0'; $Shortcut.WindowStyle = 1; $Shortcut.Save()}"

echo ✅ Atalho criado na área de trabalho

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    INSTALAÇÃO CONCLUÍDA!                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎉 PJE Bulk Automation instalado com sucesso!
echo 📁 Local: %INSTALL_DIR%
echo 🔗 Atalho: Área de trabalho - "PJE Bulk Automation"
echo.
echo 📋 Para usar:
echo    1. Clique duplo no atalho da área de trabalho
echo    2. Aguarde a aplicação inicializar
echo    3. Faça login no PJE manualmente
echo    4. Use a interface web em http://localhost:3000
echo.
pause
