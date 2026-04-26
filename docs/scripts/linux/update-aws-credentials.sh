#!/bin/bash
# ==========================================
# Script para atualizar credenciais AWS no Kubernetes
# Use este script quando as credenciais expirarem
# ==========================================

set -e

echo "=========================================="
echo "Atualizando credenciais AWS no Kubernetes"
echo "=========================================="

# Verificar se as credenciais AWS estao configuradas
if ! aws sts get-caller-identity &>/dev/null; then
    echo "ERRO: Credenciais AWS nao configuradas ou expiradas!"
    echo "Por favor, configure suas credenciais AWS primeiro:"
    echo "  aws configure"
    exit 1
fi

# Obter credenciais do arquivo de configuracao
AWS_ACCESS_KEY_ID=$(grep aws_access_key_id ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SECRET_ACCESS_KEY=$(grep aws_secret_access_key ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SESSION_TOKEN=$(grep aws_session_token ~/.aws/credentials | cut -d'=' -f2- | sed 's/^ *//')

echo ""
echo "Credenciais encontradas:"
echo "  Access Key ID: $AWS_ACCESS_KEY_ID"
echo "  Secret Access Key: ********"
echo "  Session Token: ********"
echo ""

# Criar arquivo YAML temporario
cat > /tmp/aws-credentials.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
  namespace: togglemaster
type: Opaque
stringData:
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
  AWS_SESSION_TOKEN: ${AWS_SESSION_TOKEN}
EOF

echo "Aplicando secret no Kubernetes..."
kubectl apply -f /tmp/aws-credentials.yaml

echo ""
echo "Reiniciando deployments afetados..."
kubectl rollout restart deployment/analytics-service -n togglemaster
kubectl rollout restart deployment/evaluation-service -n togglemaster

echo ""
echo "Aguardando pods ficarem prontos..."
sleep 30

echo ""
echo "Status dos pods:"
kubectl get pods -n togglemaster

echo ""
echo "=========================================="
echo "Credenciais atualizadas com sucesso!"
echo "=========================================="
echo ""
echo "NOTA: As credenciais do AWS Academy expiram quando a sessao do lab termina."
echo "Execute este script novamente se os servicos pararem de funcionar."
echo ""
