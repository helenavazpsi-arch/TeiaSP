@echo off
REM Script para importar Conselhos Tutelares no Firestore
REM Execute este arquivo no Windows para adicionar os 47 pontos no mapa

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo Importando 47 Conselhos Tutelares no Firestore
echo ============================================================
echo.

REM Verifica se está na pasta correta
if not exist "package.json" (
    echo Erro: Nao encontrou package.json
    echo Execute este arquivo dentro da pasta do projeto TeiaSP
    pause
    exit /b 1
)

REM Verifica se tem Node.js instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Erro: Node.js nao esta instalado ou nao esta no PATH
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js: ok
echo.

REM Verifica Firebase credentials
if not defined GOOGLE_APPLICATION_CREDENTIALS (
    echo.
    echo ⚠️  AVISO: GOOGLE_APPLICATION_CREDENTIALS nao esta configurado
    echo.
    echo Configure as credenciais do Firebase:
    echo   1. Obtenha seu arquivo .json na Console do Firebase
    echo   2. Defina a variavel de ambiente:
    echo      set GOOGLE_APPLICATION_CREDENTIALS=C:\caminho\para\sua\chave-firebase.json
    echo   3. Defina o project ID:
    echo      set FIREBASE_PROJECT_ID=seu-project-id
    echo.
)

REM Roda o import
echo Iniciando importacao...
echo.

node scripts/firestore-batch-import.js scripts/conselhos-tutelares-final.json

if errorlevel 1 (
    echo.
    echo Erro na importacao. Verifique as credenciais do Firebase.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Importacao concluida com sucesso!
echo ============================================================
echo.
pause
