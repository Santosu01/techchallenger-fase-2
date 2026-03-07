@echo off
REM ==========================================
REM LIMPEZA DE RECURSOS - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Namespace
set "NAMESPACE=togglemaster"

REM Cluster EKS
set "CLUSTER_NAME=togglemaster-cluster"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo ATENCAO! LIMPEZA DE RECURSOS
echo ==========================================
echo.
echo Este script ira deletar:
echo - Namespace do Kubernetes e todos os pods
echo.
echo Para limpar recursos AWS, use o console AWS.
echo.
pause

echo.
echo ==========================================
echo Deletando namespace do Kubernetes...
echo ==========================================
kubectl delete namespace %NAMESPACE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo Namespace deletado com sucesso!
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo ERRO ou namespace nao existe.
    echo ==========================================
)

echo.
echo ==========================================
echo Para completar a limpeza, delete via Console AWS:
echo ==========================================
echo.
echo 1. EKS Cluster: %CLUSTER_NAME%
echo 2. RDS Instances (togglemaster-*)
echo 3. ElastiCache (togglemaster-cache)
echo 4. DynamoDB Table (ToggleMasterAnalytics)
echo 5. SQS Queue (togglemaster-analytics-queue)
echo 6. ECR Repositories (opcional)
echo.

pause
