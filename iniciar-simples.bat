@echo off
title PJE Bulk Automation - SIMPLES

echo ==========================================
echo    PJE BULK AUTOMATION - INICIALIZADOR
echo ==========================================

REM Limpar processos antigos
echo Limpando processos antigos...
taskkill /f /im chrome.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Ir para diretorio do projeto
cd /d "%~dp0"

REM Verificar Node.js
echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao instalado!
    pause
    exit
)

REM Compilar projeto
echo Compilando projeto...
call npm run build
if errorlevel 1 (
    echo ERRO: Falha na compilacao!
    pause
    exit
)

REM Iniciar Chrome
echo Iniciando Chrome...
set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"

start "Chrome-PJE" %CHROME% --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-pje" --disable-web-security --no-first-run about:blank

REM Aguardar Chrome
echo Aguardando Chrome (10 segundos)...
timeout /t 10

REM Abrir interface web
echo Abrindo interface web...
start "" http://localhost:3000

REM Iniciar servidor
echo Iniciando servidor...
echo.
echo APLICACAO INICIADA!
echo Interface: http://localhost:3000
echo Chrome Debug: http://localhost:9222
echo.
echo Mantenha esta janela aberta!
echo.

node dist\src\server.js

echo Servidor finalizado.
pause
