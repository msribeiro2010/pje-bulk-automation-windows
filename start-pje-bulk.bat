@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        PJE BULK KZ                          ║
echo ║              Automação para Inclusão em Massa               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando PJE Bulk KZ...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
)

REM Compilar TypeScript se necessário
if not exist "dist" (
    echo 🔨 Compilando TypeScript...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ Erro ao compilar TypeScript!
        pause
        exit /b 1
    )
)

echo ✅ Dependências verificadas
echo.
echo 🌐 Iniciando servidor web em http://localhost:3000
echo 📱 A interface será aberta automaticamente no seu navegador
echo.
echo ⚠️  IMPORTANTE:
echo    1. Deixe esta janela aberta enquanto usar a aplicação
echo    2. Inicie o Chrome em modo debug antes de usar a automação
echo    3. Faça login no PJE manualmente antes de iniciar a automação
echo.
echo 🔧 Para iniciar o Chrome em modo debug, execute:
echo    start-chrome-debug.bat
echo.

REM Iniciar o servidor
start "PJE Bulk Server" /min cmd /c "npm run server"

REM Aguardar o servidor iniciar
timeout /t 3 /nobreak >nul

REM Abrir no navegador
start http://localhost:3000

echo ✅ PJE Bulk KZ iniciado com sucesso!
echo 🌐 Interface disponível em: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul