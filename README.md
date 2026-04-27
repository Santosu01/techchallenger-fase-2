# ToggleMaster Platform - Fase 3

[![Terraform Validate Plan](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/infra-terraform-ci.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/infra-terraform-ci.yml)
[![Terraform Apply Manual](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/infra-terraform-apply-manual.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/infra-terraform-apply-manual.yml)
[![Terraform Destroy Manual](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/infra-terraform-destroy-manual.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/infra-terraform-destroy-manual.yml)
[![Auth Service CI](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/auth-service-ci.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/auth-service-ci.yml)
[![Evaluation Service CI](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/evaluation-service-ci.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/evaluation-service-ci.yml)
[![Flag Service CI](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/flag-service-ci.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/flag-service-ci.yml)
[![Targeting Service CI](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/targeting-service-ci.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/targeting-service-ci.yml)
[![Analytics Service CI](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/analytics-service-ci.yml/badge.svg)](https://github.com/Santosu01/techchallenger-fase-2/actions/workflows/analytics-service-ci.yml)

[![Terraform](https://img.shields.io/badge/Terraform-1.8.x-7B42BC?logo=terraform)](https://developer.hashicorp.com/terraform)
[![AWS](https://img.shields.io/badge/AWS-EKS%20%7C%20RDS%20%7C%20ECR%20%7C%20SQS%20%7C%20DynamoDB-orange?logo=amazonaws)](https://aws.amazon.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions)](https://github.com/features/actions)
[![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)](https://go.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://www.python.org/)

Plataforma de feature flags em microservicos com esteiras de DevSecOps e base de infraestrutura como codigo para AWS Academy.

## Arquitetura da Plataforma

- **Microservicos**
  - `auth-service` (Go)
  - `flag-service` (Python)
  - `targeting-service` (Python)
  - `evaluation-service` (Go)
  - `analytics-service` (Python)
- **Infra AWS**
  - Networking: VPC, subnets publicas/privadas, route tables, NAT
  - Compute: EKS (cluster + node group)
  - Data: 3x RDS PostgreSQL, ElastiCache Redis, DynamoDB
  - Messaging: SQS
  - Registry: 5 repositorios ECR

## Estrutura do Repositorio

- `infra/terraform`: IaC modular da fase 3
- `.github/workflows`: pipelines de infra e servicos
- `backend-services`: codigo dos 5 microservicos
- `k8s`: manifests Kubernetes base
- `docs`: guias operacionais e status do projeto

## Pipelines de Infra

### `Terraform Validate Plan`
- Trigger: PR/push em `infra/terraform` + manual
- Etapas: `fmt`, `init`, `validate`, `plan`
- Objetivo: validar mudancas de infraestrutura antes de aplicar

### `Terraform Apply Manual`
- Trigger: manual (`workflow_dispatch`)
- Confirmacao obrigatoria: `APPLY`
- Etapas: `init`, `plan`, `apply`
- Objetivo: provisionar infraestrutura de forma controlada

### `Terraform Destroy Manual`
- Trigger: manual (`workflow_dispatch`)
- Confirmacao obrigatoria: `DESTROY`
- Etapas: `init`, `destroy`
- Objetivo: remover infraestrutura e economizar creditos Academy

## Pipelines dos Servicos (DevSecOps)

Cada servico possui um workflow dedicado, todos baseados em `service-ci-base.yml`:

- `auth-service-ci.yml`
- `evaluation-service-ci.yml`
- `flag-service-ci.yml`
- `targeting-service-ci.yml`
- `analytics-service-ci.yml`

### Fluxo comum por servico

1. **Build and Test**
   - Go: `go test ./...`
   - Python: instala deps e roda `pytest` (quando houver testes)
2. **Lint and Security**
   - Lint: `golangci-lint` / `flake8`
   - SAST: `gosec` / `bandit`
   - SCA: `trivy fs`
3. **Container**
   - `docker build`
   - `trivy image`
   - login AWS + push no ECR (quando secrets estao configurados)

## Dependencia de AWS (Online vs Offline)

- **Sem AWS online (offline):**
  - Estruturar pipelines
  - Build/lint/test/SAST/SCA local e em CI sem push
  - Revisao de codigo e docs
- **Com AWS online:**
  - Terraform `apply` e `destroy`
  - Push de imagem para ECR
  - Validacao de recursos provisionados na conta Academy

## Secrets Necessarios no GitHub Actions

### AWS base
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (Academy)
- `AWS_REGION`
- `AWS_ACCOUNT_ID`

### Terraform (`TF_VAR_*`)
- `TF_VAR_EKS_CLUSTER_ROLE_ARN`
- `TF_VAR_EKS_NODE_ROLE_ARN`
- `TF_VAR_RDS_MASTER_USERNAME`
- `TF_VAR_RDS_MASTER_PASSWORD`

> Importante: nunca versionar credenciais em arquivos do repositorio.

## Estado Atual

- Epico 1 (Terraform e Infra): concluido e validado com ciclo completo (`apply` + validacao AWS + `destroy`)
- Epico 2 (CI DevSecOps): base pronta, validacao integral dos 5 servicos em andamento
- Epico 3 (GitOps/ArgoCD): planejado para proxima fase de execucao

Detalhamento de status: `docs/roteiro-fase3-status.md`.

