@echo off
REM ==========================================
REM AUTENTICAR NO ECR - ToggleMaster
REM ==========================================
REM EDITE SEU ID DA AWS ABAIXO (12 dígitos):

set "REGIAO=us-east-1"
set "REGISTRY_ID=123456789012"

echo ==========================================
echo Autenticando no Amazon ECR...
echo ==========================================
echo.
echo Regiao: %REGIAO%
echo Registry: %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com
echo.

aws ecr get-login-password --region %REGIAO% | docker login --username AWS --password-stdin %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCESSO! Autenticado no ECR.
) else (
    echo.
    echo ERRO! Falha na autenticacao.
    echo.
    echo Possiveis causas:
    echo 1. AWS CLI nao instalada
    echo 2. Credenciais nao configuradas
    echo 3. REGISTRY_ID incorreto
)
echo.
pause
