# Terraform - Tech Challenge Fase 3

Esta pasta contem a base de IaC para o Epico 1:

- Networking: VPC, subnets publicas/privadas, route tables e NAT opcional
- EKS: cluster e node group
- Dados: 3x RDS PostgreSQL, 1x ElastiCache Redis, 1x DynamoDB, 1x SQS
- ECR: 5 repositorios dos microsservicos
- Backend remoto: suporte para S3 + lockfile

## Estrutura

- `main.tf`: orquestracao dos modulos
- `providers.tf`: providers e backend remoto (S3)
- `variables.tf`: variaveis de entrada
- `outputs.tf`: outputs principais
- `terraform.tfvars.example`: exemplo de valores
- `modules/`: modulos reutilizaveis

## Pre-requisitos

- Terraform >= 1.6
- Credenciais AWS configuradas (perfil local ou role)
- Bucket S3 ja criado para o state remoto (bootstrap)

Nome padrao do bucket de state (em `providers.tf`): **`556939139551-togglemaster-tfstate`**.

Crie esse bucket manualmente na conta `556939139551`, regiao `us-east-1`, antes do primeiro `terraform init`.

## Como usar

1. Copie `terraform.tfvars.example` para `terraform.tfvars`.
2. Ajuste os valores de ambiente, subnets, ARNs e tamanho dos recursos.
3. Confirme o backend em `providers.tf` (bucket/key/region) se precisar de outro ambiente.
4. Rode:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

## Observacoes AWS Academy

- Nao crie IAM Roles/Policies via Terraform.
- Informe `eks_cluster_role_arn` e `eks_node_role_arn` apontando para a LabRole.

## Observacoes Conta Pessoal

- Esta base espera ARNs existentes para EKS.
- Se desejarem, depois podemos adicionar modulo IAM para criar roles automaticamente.
