#!/bin/bash
# ==========================================
# CONFIGURAR AWS CLI - ToggleMaster
# ==========================================
# EDITE AS VARIAVEIS ABAIXO:

# AWS Access Key ID
AWS_ACCESS_KEY_ID="ASIA2NPUKVQY23KOE76E"

# AWS Secret Access Key
AWS_SECRET_ACCESS_KEY="4JPzSXHELNpC61sYS5Fyis98e9FwWqzBabWDNUjE"

# AWS Session Token (OBRIGATÓRIO para credenciais temporárias/federation/SSO)
# Deixe em branco se usa access key permanente
AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjEDsaCXVzLXdlc3QtMiJGMEQCIGrqxaa2BXMZ4n2iLzTCbQvh56SnLe4WUPn58Lgdiz9IAiAg25zua3CP8/D6NNQatTOzvcS1II+iL1TVlJDrXJ6Azyq4AggEEAIaDDcxNjE2MTMzMDIyNSIM7naSg9Jb4xEEd4dSKpUCrsaPA0sayxe9SDPk7LQqouJRWVeIFa/yd6UjX8koHOBK2AkG4CtPhn/6Z2QCNkTKbFCfrJ60CSg0/9LJm+zQotff0H/IQy3cJXNAjMsvsIy361SKwuxRAnfnZV//lF0WevB7BMVrH3pukMc1hgorjaPUkELYzc4dkHoebSC6fO5yEBAmD1K+bTcGkiC2XVPGAT1cnab30wUGz82wsjcFVY+mtbGTUw2Jh6TG4fyT0aHVYqpTTT1yB4PFWM0zopTlQ2LzwMUI4FGzCLjN5ofLuSXkMOyAHCEx0kg8bYd93GKIumoKM3js2+s05yNL1l8095c8VI0nWy5Y1v/TysrGYrtnukIQwwSHd0NHrF636OP4IDqwEzDW3LHNBjqeASS68/Jj8c/Kbp6yGQGf8fTc9uN2oATlCBNUIQ2eoCcBJKdgXEiOJLVhKP0ITFaRMdRiAcz4VAgZza+tNNOxqzw7byS9buiDzoawLetwAzwW0S6h/TYOGMAOKrFqkRk7MRiDx1M+vkmZ/H3EYaGeQeLkg4NAB1uKVwMP7nmZCL700PcBL3lQQr9A+aHmYIerRMwUNtBf5GBXQMZva5BV"

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
