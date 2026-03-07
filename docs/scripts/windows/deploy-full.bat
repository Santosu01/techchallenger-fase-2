@echo off
setlocal EnableDelayedExpansion
REM ==========================================
REM DEPLOY COMPLETO - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Regiao AWS
set "REGIAO=us-east-1"

REM Seu ID da AWS (12 digitos)
set "REGISTRY_ID=123456789012"

REM Pasta onde estao os servicos
set "SERVICES_FOLDER=backend-services"

REM Lista de servicos (separados por espaco)
set "SERVICES=auth-service flag-service targeting-service evaluation-service analytics-service"

REM Cluster EKS
set "CLUSTER_NAME=togglemaster-cluster"
set "NAMESPACE=togglemaster"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Deploy Completo - ToggleMaster
echo ==========================================
echo.
echo ATENCAO: Este script ira:
echo 1. Autenticar no ECR
echo 2. Build e push das imagens
echo 3. Configurar kubectl
echo 4. Deploy no Kubernetes
echo.
pause

cls
echo.
echo ==========================================
echo [1/4] AUTENTICANDO NO ECR
echo ==========================================
aws ecr get-login-password --region %REGIAO% | docker login --username AWS --password-stdin %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha na autenticacao!
    pause
    exit /b 1
)

cls
echo.
echo ==========================================
echo [2/4] BUILD E PUSH DAS IMAGENS
echo ==========================================
for %%i in ("%~dp0..\..\..") do set "PROJECT_ROOT=%%~fi"
cd /d "%PROJECT_ROOT%"

REM Loop pelos servicos
for %%S in (%SERVICES%) do (
    echo.
    echo Processando: %%S
    cd %SERVICES_FOLDER%/%%S
    docker build -t %%S .
    docker tag %%S:latest %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com/%%S:latest
    docker push %REGISTRY_ID%.dkr.ecr.%REGIAO%.amazonaws.com/%%S:latest
    cd ../..
)

cls
echo.
echo ==========================================
echo [3/4] CONFIGURANDO KUBECTL
echo ==========================================
aws eks update-kubeconfig --region %REGIAO% --name %CLUSTER_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha na configuracao do kubectl!
    pause
    exit /b 1
)

cls
echo.
echo ==========================================
echo [4/4] DEPLOY NO KUBERNETES
echo ==========================================

set K8S_DIR=%~dp0..\..\k8s
kubectl apply -f "%K8S_DIR%\1-namespace.yaml"
kubectl apply -f "%K8S_DIR%\2-secrets.yaml"
kubectl apply -f "%K8S_DIR%\3-configmap.yaml"
kubectl apply -f "%K8S_DIR%\4-deployments.yaml"
kubectl apply -f "%K8S_DIR%\5-ingress.yaml"
kubectl apply -f "%K8S_DIR%\6-hpa.yaml"

cls
echo.
echo ==========================================
echo Verificando status dos pods...
echo ==========================================
kubectl get pods -n %NAMESPACE%

echo.
echo ==========================================
echo DEPLOY COMPLETO CONCLUIDO!
echo ==========================================
echo.
echo Para testar os servicos, execute:
echo   test-api.bat
echo.

pause
