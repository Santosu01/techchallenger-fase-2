@echo off
setlocal EnableDelayedExpansion
REM ==========================================
REM BUILD E PUSH DE IMAGENS DOCKER - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Regiao AWS
set "REGIAO=us-east-1"

REM Seu ID da AWS (12 digitos)
set "REGISTRY_ID=886833754732"

REM Pasta onde estao os servicos
set "SERVICES_FOLDER=backend-services"

REM Lista de servicos (separados por espaco)
set "SERVICES=auth-service flag-service targeting-service evaluation-service analytics-service"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Build e Push de Imagens Docker
echo ==========================================

REM Primeiro autenticar no ECR
echo.
echo [1/6] Autenticando no ECR...
aws ecr get-login-password --region %REGIAO% | docker login --username AWS --password-stdin %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha na autenticacao!
    pause
    exit /b 1
)

REM Navega para a raiz do projeto
for %%i in ("%~dp0..\..\..") do set "PROJECT_ROOT=%%~fi"
cd /d "%PROJECT_ROOT%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Nao foi possivel navegar para a raiz do projeto!
    echo Caminho tentado: %PROJECT_ROOT%
    pause
    exit /b 1
)

echo Diretorio atual: %CD%
echo.

REM Contador para progresso
set COUNTER=2

REM Loop pelos servicos
for %%S in (%SERVICES%) do (
    echo.
    echo ==========================================
    echo [!COUNTER!/6] Build e Push: %%S
    echo ==========================================

    cd %SERVICES_FOLDER%/%%S || (
        echo ERRO: Pasta %SERVICES_FOLDER%/%%S nao encontrada!
        pause
        exit /b 1
    )

    docker build -t %%S . || (
        echo ERRO: Falha no build do %%S!
        pause
        exit /b 1
    )

    docker tag %%S:latest %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com/%%S:latest || (
        echo ERRO: Falha no tag do %%S!
        pause
        exit /b 1
    )

    docker push %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com/%%S:latest || (
        echo ERRO: Falha no push do %%S!
        pause
        exit /b 1
    )

    cd ../..

    set /a COUNTER+=1
)

echo.
echo ==========================================
echo SUCESSO! Todas as imagens foram pushadas!
echo ==========================================
echo.
pause
