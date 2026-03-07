@echo off
REM ==========================================
REM CONFIGURAR KUBECTL - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Regiao AWS
set "REGIAO=us-east-1"

REM Cluster EKS
set "CLUSTER_NAME=togglemaster-cluster"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Configurando kubectl para o Cluster EKS
echo ==========================================

echo.
echo Atualizando kubeconfig...
echo Cluster: %CLUSTER_NAME%
echo Regiao: %REGIAO%
echo.

aws eks update-kubeconfig --region %REGIAO% --name %CLUSTER_NAME%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo SUCESSO! kubectl configurado.
    echo ==========================================
    echo.
    echo Testando conexao...
    kubectl get nodes
    echo.
    echo Verificando namespaces...
    kubectl get namespaces
) else (
    echo.
    echo ==========================================
    echo ERRO! Falha na configuracao do kubectl.
    echo ==========================================
    echo.
    echo Possiveis causas:
    echo 1. AWS CLI nao instalada
    echo 2. kubectl nao instalado
    echo 3. Credenciais nao configuradas
    echo 4. Cluster EKS nao existe ou nao esta ativo
)

echo.
pause
