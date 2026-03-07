@echo off
REM ==========================================
REM DEPLOY NO KUBERNETES - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Namespace
set "NAMESPACE=togglemaster"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Deploy no Kubernetes (EKS)
echo ==========================================

REM Define o diretório dos manifestos
set K8S_DIR=%~dp0..\..\k8s

if not exist "%K8S_DIR%" (
    echo ERRO: Pasta k8s nao encontrada em %K8S_DIR%
    echo Crie a pasta e adicione os manifestos YAML primeiro.
    pause
    exit /b 1
)

echo.
echo Diretorio dos manifestos: %K8S_DIR%
echo Namespace: %NAMESPACE%
echo.

echo ==========================================
echo Aplicando manifestos em ordem:
echo ==========================================

echo.
echo [1/6] Namespace...
kubectl apply -f "%K8S_DIR%\1-namespace.yaml"

echo [2/6] Secrets...
kubectl apply -f "%K8S_DIR%\2-secrets.yaml"

echo [3/6] ConfigMap...
kubectl apply -f "%K8S_DIR%\3-configmap.yaml"

echo [4/6] Deployments e Services...
kubectl apply -f "%K8S_DIR%\4-deployments.yaml"

echo [5/6] Ingress...
kubectl apply -f "%K8S_DIR%\5-ingress.yaml"

echo [6/6] HPA...
kubectl apply -f "%K8S_DIR%\6-hpa.yaml"

echo.
echo ==========================================
echo Verificando status dos pods...
echo ==========================================
kubectl get pods -n %NAMESPACE%

echo.
echo ==========================================
echo Verificando services...
echo ==========================================
kubectl get services -n %NAMESPACE%

echo.
echo ==========================================
echo Verificando ingress...
echo ==========================================
kubectl get ingress -n %NAMESPACE%

echo.
echo ==========================================
echo Verificando HPA...
echo ==========================================
kubectl get hpa -n %NAMESPACE%

echo.
echo ==========================================
echo Deploy concluido!
echo ==========================================
pause
