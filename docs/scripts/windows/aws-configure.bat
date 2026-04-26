@echo off
REM ==========================================
REM CONFIGURAR AWS CLI - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM AWS Access Key ID
set "AWS_ACCESS_KEY_ID=SUA_CHAVE_AQUI"

REM AWS Secret Access Key
set "AWS_SECRET_ACCESS_KEY=SUA_CHAVE_AQUI"

REM AWS Session Token (OBRIGATORIO para credenciais temporarias/federation/SSO)
REM Deixe em branco se usa access key permanente
set "AWS_SESSION_TOKEN=SUA_CHAVE_AQUI"

REM Regiao padrao
set "AWS_DEFAULT_REGION=us-east-1"

REM Output format (json, text, table)
set "AWS_DEFAULT_OUTPUT=json"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Configurar AWS CLI
echo ==========================================
echo.
echo Configurando credenciais AWS...
echo.

REM Configurar AWS CLI com as constantes
aws configure set aws_access_key_id "%AWS_ACCESS_KEY_ID%"
aws configure set aws_secret_access_key "%AWS_SECRET_ACCESS_KEY%"

REM Configurar session token apenas se nao estiver vazio
if not "%AWS_SESSION_TOKEN%"=="" (
    aws configure set aws_session_token "%AWS_SESSION_TOKEN%"
    echo Session Token: configurado
)

aws configure set default.region "%AWS_DEFAULT_REGION%"
aws configure set default.output "%AWS_DEFAULT_OUTPUT%"

echo.
echo ==========================================
echo Configuracoes aplicadas:
echo ==========================================
echo Access Key ID: %AWS_ACCESS_KEY_ID%
echo Secret Access Key: *** (oculto)
if not "%AWS_SESSION_TOKEN%"=="" (
    echo Session Token: *** (oculto)
) else (
    echo Session Token: (nao usado)
)
echo Region: %AWS_DEFAULT_REGION%
echo Output: %AWS_DEFAULT_OUTPUT%
echo.

echo ==========================================
echo Testando configuracao...
echo ==========================================
aws sts get-caller-identity

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCESSO! AWS CLI configurada.
    echo Credenciais validas!
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo AVISO! Nao foi possivel verificar as credenciais.
    echo ==========================================
    echo.
    echo Possiveis causas:
    echo 1. AWS CLI nao instalada
    echo 2. Credenciais invalidas
    echo 3. Session Token expirado (se usando credenciais temporarias)
    echo 4. Problema de conexao
)

echo.
pause
