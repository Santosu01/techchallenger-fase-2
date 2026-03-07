@echo off
REM ==========================================
REM CRIAR REPOSITÓRIOS ECR - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Regiao AWS
set "REGIAO=us-east-1"

REM Seu ID da AWS (12 digitos)
set "REGISTRY_ID=123456789012"

REM Nomes dos repositorios
set "REPO_AUTH=auth-service"
set "REPO_FLAG=flag-service"
set "REPO_TARGETING=targeting-service"
set "REPO_EVALUATION=evaluation-service"
set "REPO_ANALYTICS=analytics-service"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Criar Repositorios no Amazon ECR
echo ==========================================

echo.
echo Criando repositórios no ECR...
echo Regiao: %REGIAO%
echo.

echo [1/5] Criando repositório: %REPO_AUTH%
aws ecr create-repository --repository-name %REPO_AUTH% --region %REGIAO% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Criado com sucesso!
) else (
    echo Ja existe ou erro na criacao.
)

echo [2/5] Criando repositório: %REPO_FLAG%
aws ecr create-repository --repository-name %REPO_FLAG% --region %REGIAO% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Criado com sucesso!
) else (
    echo Ja existe ou erro na criacao.
)

echo [3/5] Criando repositório: %REPO_TARGETING%
aws ecr create-repository --repository-name %REPO_TARGETING% --region %REGIAO% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Criado com sucesso!
) else (
    echo Ja existe ou erro na criacao.
)

echo [4/5] Criando repositório: %REPO_EVALUATION%
aws ecr create-repository --repository-name %REPO_EVALUATION% --region %REGIAO% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Criado com sucesso!
) else (
    echo Ja existe ou erro na criacao.
)

echo [5/5] Criando repositório: %REPO_ANALYTICS%
aws ecr create-repository --repository-name %REPO_ANALYTICS% --region %REGIAO% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Criado com sucesso!
) else (
    echo Ja existe ou erro na criacao.
)

echo.
echo ==========================================
echo Listando todos os repositórios:
echo ==========================================
aws ecr describe-repositories --region %REGIAO% --query "repositories[?contains(repositoryName, 'service') || contains(repositoryName, 'auth') || contains(repositoryName, 'flag') || contains(repositoryName, 'targeting') || contains(repositoryName, 'evaluation') || contains(repositoryName, 'analytics')].repositoryName" --output table

echo.
pause
