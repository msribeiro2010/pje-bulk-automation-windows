@echo off
title PJE Bulk Automation - Inicializador

echo.
echo ========================================
echo    PJE BULK AUTOMATION - WINDOWS
echo ========================================
echo.
echo Iniciando aplicacao...
echo.

REM Matar processos Chrome existentes para evitar conflitos
echo Limpando processos Chrome antigos...
taskkill /f /im chrome.exe >nul 2>&1

REM Matar processos Node existentes para evitar conflitos
echo Limpando processos Node antigos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Aguardando limpeza...
timeout /t 3 >nul

REM Navegar para o diretório do projeto
cd /d "%~dp0"

REM Verificar se o Node.js está instalado
echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO: Erro ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Compilar o projeto
echo Compilando projeto...
npm run build
if errorlevel 1 (
    echo ERRO: Erro ao compilar projeto!
    pause
    exit /b 1
)

REM Detectar caminho do Chrome
set CHROME_PATH=""
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) else (
    echo ERRO: Google Chrome nao encontrado!
    echo Instale o Google Chrome: https://www.google.com/chrome/
    pause
    exit /b 1
)

echo Chrome encontrado em: %CHROME_PATH%
echo.

REM Iniciar Chrome em modo debug
echo Iniciando Chrome em modo debug...
echo Comando: %CHROME_PATH% --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-debug-pje --no-first-run --no-default-browser-check --disable-web-security --new-window about:blank
start "Chrome Debug PJE" %CHROME_PATH% --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-debug-pje --no-first-run --no-default-browser-check --disable-web-security --new-window about:blank

REM Aguardar Chrome inicializar
echo Aguardando Chrome inicializar...
timeout /t 8 >nul

REM Verificar se Chrome está rodando
echo Verificando se Chrome esta respondendo...
curl http://localhost:9222/json/version >nul 2>&1
if errorlevel 1 (
    echo AVISO: Chrome pode nao ter iniciado corretamente
    echo Tentando continuar mesmo assim...
) else (
    echo Chrome esta respondendo na porta 9222
)

REM Iniciar servidor da aplicação
echo Iniciando servidor da aplicacao...
echo.
echo Aplicacao iniciada com sucesso!
echo.
echo Acesse: http://localhost:3000
echo Chrome Debug: http://localhost:9222
echo.
echo IMPORTANTE: 
echo    - Deixe esta janela aberta enquanto usar a aplicacao
echo    - Faca login no PJE na aba do Chrome que se abriu
echo    - Use a interface web em http://localhost:3000
echo.
echo Para parar: Feche esta janela ou pressione Ctrl+C
echo.

REM Abrir automaticamente a interface web no navegador padrão
echo Abrindo interface web...
timeout /t 2 >nul
start "" "http://localhost:3000"

REM Iniciar o servidor Node.js
echo Iniciando servidor Node.js...
node "dist\src\server.js"

REM Se chegou aqui, o servidor parou
echo.
echo Servidor parado.
pause
