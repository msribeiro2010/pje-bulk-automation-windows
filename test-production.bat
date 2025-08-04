@echo off
chcp 65001 >nul
echo.
echo 🧪 Testando ambiente de produção...
echo.

REM Definir ambiente de produção
set NODE_ENV=production

echo 🔨 Compilando projeto para produção...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build de produção!
    echo.
    echo Verifique:
    echo - Se todas as dependências estão instaladas (npm install)
    echo - Se não há erros de TypeScript no código
    echo - Se o arquivo tsconfig.json está correto
    pause
    exit /b 1
)

echo ✅ Build de produção concluído com sucesso!
echo.
echo 📁 Arquivos gerados em: dist/
echo 🌐 Para testar, execute: npm start
echo.
echo Pressione qualquer tecla para continuar...
pause >nul