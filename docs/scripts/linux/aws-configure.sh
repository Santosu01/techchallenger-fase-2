#!/bin/bash
# ==========================================
# CONFIGURAR AWS CLI - ToggleMaster
# ==========================================
# EDITE AS VARIAVEIS ABAIXO:

# AWS Access Key ID
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"

# AWS Secret Access Key
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# AWS Session Token (OBRIGATÓRIO para credenciais temporárias/federation/SSO)
# Deixe em branco se usa access key permanente
AWS_SESSION_TOKEN=""

# Região padrão
AWS_DEFAULT_REGION="us-east-1"

# Output format (json, text, table)
AWS_DEFAULT_OUTPUT="json"

# ==========================================
# INÍCIO DO SCRIPT
# ==========================================

echo "=========================================="
echo "Configurar AWS CLI"
echo "=========================================="
echo ""
echo "Configurando credenciais AWS..."
echo ""

# Configurar AWS CLI com as constantes
aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"

# Configurar session token apenas se não estiver vazio
if [ -n "$AWS_SESSION_TOKEN" ]; then
    aws configure set aws_session_token "$AWS_SESSION_TOKEN"
    echo "Session Token: configurado"
fi

aws configure set default.region "$AWS_DEFAULT_REGION"
aws configure set default.output "$AWS_DEFAULT_OUTPUT"

echo ""
echo "=========================================="
echo "Configurações aplicadas:"
echo "=========================================="
echo "Access Key ID: $AWS_ACCESS_KEY_ID"
echo "Secret Access Key: *** (oculto)"
if [ -n "$AWS_SESSION_TOKEN" ]; then
    echo "Session Token: *** (oculto)"
else
    echo "Session Token: (não usado)"
fi
echo "Region: $AWS_DEFAULT_REGION"
echo "Output: $AWS_DEFAULT_OUTPUT"
echo ""

echo "=========================================="
echo "Testando configuração..."
echo "=========================================="
aws sts get-caller-identity

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "SUCESSO! AWS CLI configurada."
    echo "Credenciais válidas!"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "AVISO! Não foi possível verificar as credenciais."
    echo "=========================================="
    echo ""
    echo "Possíveis causas:"
    echo "1. AWS CLI não instalada"
    echo "2. Credenciais inválidas"
    echo "3. Session Token expirado (se usando credenciais temporárias)"
    echo "4. Problema de conexão"
fi

echo ""
