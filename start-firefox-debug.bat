@echo off
chcp 65001 >nul
echo.
echo 🦊 Iniciando Firefox com debugging habilitado...
echo 📍 Porta CDP: 9223
echo.
echo ⚠️  IMPORTANTE: Deixe esta janela aberta enquanto usar a automação
echo.

REM Mata processos Firefox existentes (opcional)
REM taskkill /f /im firefox.exe 2>nul

REM Detectar caminho do Firefox
set FIREFOX_PATH=""
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    set FIREFOX_PATH="C:\Program Files\Mozilla Firefox\firefox.exe"
) else if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" (
    set FIREFOX_PATH="C:\Program Files (x86)\Mozilla Firefox\firefox.exe"
) else (
    echo ❌ Mozilla Firefox não encontrado!
    echo 📥 Instale o Mozilla Firefox: https://www.mozilla.org/firefox/
    pause
    exit /b 1
)

echo ✅ Firefox encontrado em: %FIREFOX_PATH%
echo.

REM Inicia Firefox com debugging
start "Firefox Debug" %FIREFOX_PATH% --start-debugger-server=9223 --profile %TEMP%\firefox-debug --no-remote --new-instance

echo ✅ Firefox iniciado em modo debug
echo 🔗 Para conectar, use a porta 9223
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul