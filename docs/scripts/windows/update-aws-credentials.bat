@echo off
REM ==========================================
REM Script para atualizar credenciais AWS no Kubernetes
REM Use este script quando as credenciais expirarem
REM ==========================================

echo ==========================================
echo Atualizando credenciais AWS no Kubernetes
echo ==========================================

REM Verificar se as credenciais AWS estao configuradas
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ERRO: Credenciais AWS nao configuradas ou expiradas!
    echo Por favor, configure suas credenciais AWS primeiro:
    echo   aws configure
    exit /b 1
)

REM Obter credenciais do arquivo de configuracao
for /f "tokens=3" %%a in ('type "%USERPROFILE%\.aws\credentials" ^| findstr "aws_access_key_id"') do set AWS_ACCESS_KEY_ID=%%a
for /f "tokens=3" %%a in ('type "%USERPROFILE%\.aws\credentials" ^| findstr "aws_secret_access_key"') do set AWS_SECRET_ACCESS_KEY=%%a

REM Obter o session token (pode ter espacos)
for /f "tokens=2 delims==" %%a in ('type "%USERPROFILE%\.aws\credentials" ^| findstr "aws_session_token"') do set AWS_SESSION_TOKEN=%%a

echo.
echo Credenciais encontradas:
echo   Access Key ID: %AWS_ACCESS_KEY_ID%
echo   Secret Access Key: ********
echo   Session Token: ********
echo.

REM Criar arquivo YAML temporario
echo apiVersion: v1 > "%TEMP%\aws-credentials.yaml"
echo kind: Secret >> "%TEMP%\aws-credentials.yaml"
echo metadata: >> "%TEMP%\aws-credentials.yaml"
echo   name: aws-credentials >> "%TEMP%\aws-credentials.yaml"
echo   namespace: togglemaster >> "%TEMP%\aws-credentials.yaml"
echo type: Opaque >> "%TEMP%\aws-credentials.yaml"
echo stringData: >> "%TEMP%\aws-credentials.yaml"
echo   AWS_ACCESS_KEY_ID: %AWS_ACCESS_KEY_ID% >> "%TEMP%\aws-credentials.yaml"
echo   AWS_SECRET_ACCESS_KEY: %AWS_SECRET_ACCESS_KEY% >> "%TEMP%\aws-credentials.yaml"
echo   AWS_SESSION_TOKEN: %AWS_SESSION_TOKEN% >> "%TEMP%\aws-credentials.yaml"

echo Aplicando secret no Kubernetes...
kubectl apply -f "%TEMP%\aws-credentials.yaml"
if errorlevel 1 (
    echo ERRO: Falha ao aplicar secret!
    exit /b 1
)

echo.
echo Reiniciando deployments afetados...
kubectl rollout restart deployment/analytics-service -n togglemaster
kubectl rollout restart deployment/evaluation-service -n togglemaster

echo.
echo Aguardando pods ficarem prontos...
timeout /t 30 /nobreak >nul

echo.
echo Status dos pods:
kubectl get pods -n togglemaster

echo.
echo ==========================================
echo Credenciais atualizadas com sucesso!
echo ==========================================
echo.
echo NOTA: As credenciais do AWS Academy expiram quando a sessao do lab termina.
echo Execute este script novamente se os servicos pararem de funcionar.
echo.
