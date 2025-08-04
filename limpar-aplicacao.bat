@echo off
chcp 65001 >nul
title PJE Bulk Automation - Limpeza/Desinstalação

echo.
echo ========================================
echo    PJE BULK AUTOMATION - LIMPEZA
echo ========================================
echo.

echo ⚠️  Este script irá:
echo    - Parar todos os processos da aplicação
echo    - Remover o atalho da área de trabalho
echo    - Limpar arquivos temporários
echo.

set /p confirm="Deseja continuar? (s/n): "
if /i not "%confirm%"=="s" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo 🧹 Limpando processos...

REM Parar processos Chrome do debug
taskkill /f /im chrome.exe >nul 2>&1

REM Parar processos Node.js
taskkill /f /im node.exe >nul 2>&1

echo ✅ Processos finalizados.

REM Remover atalho da área de trabalho
echo 🗑️  Removendo atalho...
del "%USERPROFILE%\Desktop\PJE Bulk Automation.lnk" >nul 2>&1
if exist "%USERPROFILE%\Desktop\PJE Bulk Automation.lnk" (
    echo ⚠️  Não foi possível remover o atalho automaticamente.
    echo 📁 Remova manualmente: %USERPROFILE%\Desktop\PJE Bulk Automation.lnk
) else (
    echo ✅ Atalho removido.
)

REM Limpar arquivos temporários
echo 🧹 Limpando arquivos temporários...
if exist "%TEMP%\chrome-debug-pje" (
    rmdir /s /q "%TEMP%\chrome-debug-pje" >nul 2>&1
    echo ✅ Cache do Chrome removido.
)

if exist "data\temp-config.json" (
    del "data\temp-config.json" >nul 2>&1
    echo ✅ Configurações temporárias removidas.
)

if exist "data\uploads" (
    rmdir /s /q "data\uploads" >nul 2>&1
    echo ✅ Uploads temporários removidos.
)

echo.
echo ✅ Limpeza concluída!
echo.
echo 💡 NOTA: Os arquivos do projeto foram mantidos.
echo    Para remover completamente, delete a pasta:
echo    %~dp0
echo.

pause
