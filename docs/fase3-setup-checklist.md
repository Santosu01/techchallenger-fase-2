# Fase 3 - Checklist de Setup (Terraform + GitHub Actions)

Este arquivo lista os dados que faltam para fechar a configuracao real do Epico 1 e pipelines.

## Conta e regiao (ja definidos no projeto)

- **AWS Account ID:** `556939139551`
- **Regiao:** `us-east-1`

## 1) Terraform (obrigatorio)

- `aws_region` (ex: `us-east-1`)
- `aws_profile` (se usar perfil local)
- `eks_cluster_role_arn`
- `eks_node_role_arn`
- `rds_master_username`
- `rds_master_password`

Roles EKS da conta (ja validadas):

- `eks_cluster_role_arn`: `arn:aws:iam::556939139551:role/c208526a5300486l14867713t1w556939-LabEksClusterRole-2AFY32J2abPo`
- `eks_node_role_arn`: `arn:aws:iam::556939139551:role/c208526a5300486l14867713t1w556939139-LabEksNodeRole-HKbXTIoFsL6x`

### Backend remoto (S3 state)

O backend esta configurado em `infra/terraform/providers.tf` com o bucket:

- **`556939139551-togglemaster-tfstate`** (nome globalmente unico com prefixo da conta)

**Bootstrap obrigatorio:** o bucket precisa existir **antes** do primeiro `terraform init`. Crie no console AWS (S3) ou via CLI, com versionamento e bloqueio de acesso publico recomendados.

## 2) GitHub Actions (credenciais)

**Sim: o ideal e usar GitHub Secrets** (Settings > Secrets and variables > Actions > Repository secrets). Nunca commitar chaves no repositorio.

Secrets usados pelos workflows atuais:

- `AWS_REGION` — ex: `us-east-1`
- `AWS_ACCOUNT_ID` — `556939139551`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (obrigatorio em sessoes temporarias, ex. AWS Academy)

Sem esses secrets, o pipeline executa build/lint/scans, mas o push no ECR e pulado.

**Melhor pratica (opcional, fase seguinte):** trocar chaves longas por **OIDC** (`aws-actions/configure-aws-credentials` com `role-to-assume`), sem `AWS_SECRET_ACCESS_KEY` no GitHub.

## 3) Recomendacoes imediatas

1. Copiar `infra/terraform/terraform.tfvars.example` para `infra/terraform/terraform.tfvars`.
2. Preencher os valores reais do ambiente.
3. Rodar localmente:
   - `terraform init`
   - `terraform validate`
   - `terraform plan`
4. Abrir PR para validar os 5 workflows em branch.

## 4) Senha RDS

Use uma senha forte em `terraform.tfvars` (arquivo local, listado no `.gitignore`). Nao coloque senha em issue/PR; compartilhe apenas pelo canal seguro do grupo se necessario.

## 5) Economia de creditos (Academy)

- Preferir ambiente efemero: subir para teste/demonstracao e destruir ao fim.
- Usar pipeline manual de destroy (sem cron) para evitar apagar ambiente em horario errado.
