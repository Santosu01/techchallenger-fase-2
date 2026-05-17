# Roteiro de Entrega - Tech Challenge Fase 3

Este documento detalha o passo a passo para a execução do projeto e o roteiro para a gravação do vídeo de demonstração.

## 1. Passo a Passo de Execução (Guia Técnico)

### Pré-requisitos
- Conta AWS (Academy ou Pessoal).
- AWS CLI configurado.
- Terraform instalado.
- kubectl instalado.
- ArgoCD CLI instalado (opcional, mas recomendado).

### Fase 1: Infraestrutura (Terraform)
1. **Configuração do Backend**: Certifique-se de que o bucket S3 especificado em `infra/terraform/providers.tf` existe.
2. **Inicialização**:
   ```bash
   cd infra/terraform
   terraform init
   ```
3. **Planejamento**:
   ```bash
   terraform plan -out=plan.out
   ```
4. **Aplicação**:
   ```bash
   terraform apply plan.out
   ```
5. **Configuração do kubeconfig**:
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name togglemaster-cluster
   ```

### Fase 2: GitOps e ArgoCD
1. **Instalação do ArgoCD**:
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
2. **Acesso ao ArgoCD**:
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   ```
   - Usuário: `admin`
   - Senha (obter via comando): `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
3. **Configuração do Repositório**: Adicione o repositório de GitOps no ArgoCD e crie as Applications para os 5 microsserviços.

### Fase 3: CI/CD e DevSecOps
1. **Secrets do GitHub**: Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `GIT_TOKEN` (para o GitOps) nas configurações do repositório.
2. **Execução do Pipeline**: O pipeline é disparado automaticamente em cada Push ou PR.

---

## 2. Roteiro do Vídeo de Demonstração (Script)

**Duração estimada:** 15-20 minutos.

### Introdução (2 min)
- Apresentação dos integrantes.
- Visão geral do ToggleMaster e os 5 microsserviços.
- Objetivo: Infraestrutura imutável, DevSecOps e GitOps.

### Parte 1: Infraestrutura como Código (4 min)
- **O que mostrar:**
  - Estrutura de módulos do Terraform.
  - Explicação do `providers.tf` com backend S3.
  - Execução de `terraform plan` ou mostrar os recursos já criados na console AWS (VPC, EKS, RDS, Redis, DynamoDB, SQS).
- **Fala sugerida:** "Utilizamos o Terraform para provisionar toda a malha de rede, banco de dados e o cluster EKS. Seguimos a restrição do AWS Academy utilizando a LabRole existente."

### Parte 2: Pipeline DevSecOps (6 min)
- **O que mostrar:**
  - Demonstração do pipeline no GitHub Actions.
  - **Cenário de Falha:** Alterar um arquivo (ex: `auth-service/main.go`) inserindo uma vulnerabilidade ou erro de lint proposital. Mostrar o pipeline bloqueando no estágio de Security Scan (Trivy ou Gosec).
  - **Cenário de Sucesso:** Corrigir o erro e mostrar o pipeline passando por todos os estágios: Linter, SAST, SCA, Docker Build, Container Scan e Push para o ECR.
- **Fala sugerida:** "Nosso pipeline integra segurança desde o início. Se o Trivy detectar uma vulnerabilidade crítica ou o Gosec encontrar falhas no código, o deploy é interrompido."

### Parte 3: GitOps com ArgoCD (6 min)
- **O que mostrar:**
  - O passo final do CI atualizando a tag da imagem no repositório de manifestos.
  - Interface do ArgoCD.
  - Mostrar o ArgoCD detectando a mudança (Out of Sync) e realizando o Sync automático para o EKS.
  - Teste rápido de um endpoint (ex: Health check) de um dos serviços.
- **Fala sugerida:** "Não fazemos push direto para o cluster. O pipeline atualiza o repositório GitOps e o ArgoCD garante que o estado do cluster reflita fielmente o que está no Git."

### Conclusão (2 min)
- Resumo dos benefícios alcançados: Segurança, rastreabilidade e automação total.
- Encerramento.

---

## 3. Comandos Úteis para o Vídeo

---

## 4. Dicas para o Cenário de Falha (Vídeo)

Para demonstrar o pipeline bloqueando por segurança, siga um destes passos:

### Opção A: Falha de Segurança (Gosec)
1. Abra `backend-services/auth-service/handlers.go`.
2. Na função `healthHandler`, adicione: `password := "admin123"`.
3. Faça o commit e push. O pipeline falhará no job **SAST**.

### Opção B: Falha de Lint (GolangCI-Lint)
1. Abra `backend-services/auth-service/handlers.go`.
2. Na função `healthHandler`, adicione: `var unusedVar string`.
3. Faça o commit e push. O pipeline falhará no job **Lint**.

### Opção C: Falha de Vulnerabilidade de Imagem (Trivy)
1. No `Dockerfile` de qualquer serviço, use uma imagem base muito antiga (ex: `FROM golang:1.15`).
2. O pipeline falhará no job **Container Scan**.
