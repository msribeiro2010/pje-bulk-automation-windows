@echo off
chcp 65001 >nul
echo.
echo 🚀 Iniciando Chrome com debugging habilitado...
echo 📍 Porta CDP: 9222
echo 🌐 Acesse: http://localhost:9222 para ver as abas disponíveis
echo.
echo ⚠️  IMPORTANTE: Deixe esta janela aberta enquanto usar a automação
echo.

REM Mata processos Chrome existentes (opcional)
REM taskkill /f /im chrome.exe 2>nul

REM Detectar caminho do Chrome
set CHROME_PATH=""
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) else (
    echo ❌ Google Chrome não encontrado!
    echo 📥 Instale o Google Chrome: https://www.google.com/chrome/
    pause
    exit /b 1
)

echo ✅ Chrome encontrado em: %CHROME_PATH%
echo.

REM Inicia Chrome com debugging
start "Chrome Debug" %CHROME_PATH% --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-debug --no-first-run --no-default-browser-check --disable-web-security --disable-features=VizDisplayCompositor

echo ✅ Chrome iniciado em modo debug
echo 🔗 Para conectar, use a porta 9222
echo 📱 Interface de debug: http://localhost:9222
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul