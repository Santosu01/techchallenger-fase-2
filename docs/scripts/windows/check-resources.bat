@echo off
REM ==========================================
REM VERIFICAR STATUS - ToggleMaster
REM ==========================================
REM EDITE AS VARIAVEIS ABAIXO:

REM Regiao AWS
set "REGIAO=us-east-1"

REM Cluster EKS
set "CLUSTER_NAME=togglemaster-cluster"
set "NAMESPACE=togglemaster"

REM ==========================================
REM INÍCIO DO SCRIPT
REM ==========================================

echo ==========================================
echo Status dos Recursos - ToggleMaster
echo ==========================================

echo.
echo ==========================================
echo CLUSTER EKS
echo ==========================================
echo Cluster: %CLUSTER_NAME%
aws eks describe-cluster --name %CLUSTER_NAME% --region %REGIAO% --query "cluster.status" --output text

echo.
echo ==========================================
echo NODES
echo ==========================================
kubectl get nodes

echo.
echo ==========================================
echo PODS - Namespace: %NAMESPACE%
echo ==========================================
kubectl get pods -n %NAMESPACE%

echo.
echo ==========================================
echo SERVICES - Namespace: %NAMESPACE%
echo ==========================================
kubectl get services -n %NAMESPACE%

echo.
echo ==========================================
echo INGRESS - Namespace: %NAMESPACE%
echo ==========================================
kubectl get ingress -n %NAMESPACE%

echo.
echo ==========================================
echo HPA - Namespace: %NAMESPACE%
echo ==========================================
kubectl get hpa -n %NAMESPACE%

echo.
echo ==========================================
echo INGRESS URL
echo ==========================================
for /f "tokens=*" %%i in ('kubectl get ingress togglemaster-ingress -n %NAMESPACE% -o jsonpath^="{.status.loadBalancer.ingress[0].hostname}" 2^>nul') do set INGRESS_URL=%%i
if defined INGRESS_URL (
    echo URL: http://%INGRESS_URL%
) else (
    echo Ingress nao encontrado ou nao possui endereco externo ainda.
)

echo.
echo ==========================================
echo RDS INSTANCES
echo ==========================================
aws rds describe-db-instances --region %REGIAO% --query "DBInstances[?contains(DBInstanceIdentifier, 'togglemaster')].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Endpoint:Endpoint.Address}" --output table

echo.
echo ==========================================
echo ELASTICACHE
echo ==========================================
aws elasticache describe-cache-clusters --region %REGIAO% --query "CacheClusters[?contains(CacheClusterId, 'togglemaster')].{ID:CacheClusterId,Status:CacheClusterStatus,Endpoint:CacheNodes[0].Endpoint.Address}" --output table

echo.
echo ==========================================
echo DYNAMODB TABLES
echo ==========================================
aws dynamodb list-tables --region %REGIAO% --query "TableNames[?contains(@, 'Toggle')]" --output table

echo.
pause
