# Checklist Unificado - Roteiro Fase 3

Checklist consolidado a partir de:
- `docs/roteiro-fase3-status.md`
- `docs/fase3-setup-checklist.md`
- `docs/step-by-step.md` (secao de roteiro de video)

## 1) Preparacao de ambiente e credenciais

- [ ] Confirmar AWS Account e regiao (`556939139551`, `us-east-1`)
- [ ] Validar roles EKS (`eks_cluster_role_arn`, `eks_node_role_arn`)
- [ ] Criar bucket de state Terraform (bootstrap do backend remoto)
- [ ] Criar `infra/terraform/terraform.tfvars` a partir do exemplo
- [ ] Preencher `rds_master_username` e `rds_master_password`
- [ ] Configurar secrets no GitHub Actions:
  - [ ] `AWS_REGION`
  - [ ] `AWS_ACCOUNT_ID`
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_SESSION_TOKEN` (quando aplicavel)

## 2) Epico 1 - Terraform e Infra

- [ ] Rodar `terraform init`
- [ ] Rodar `terraform validate`
- [ ] Rodar `terraform plan`
- [ ] Confirmar workflow `Terraform Validate Plan`
- [ ] Confirmar workflow `Terraform Apply Manual`
- [ ] Confirmar workflow `Terraform Destroy Manual`
- [ ] Validar recursos apos apply:
  - [ ] EKS
  - [ ] 3x RDS
  - [ ] ElastiCache Redis
  - [ ] DynamoDB
  - [ ] SQS
  - [ ] 5x ECR
- [ ] Validar limpeza completa no destroy

## 3) Epico 2 - CI DevSecOps

- [ ] Executar pipeline de cada servico e ajustar falhas:
  - [ ] `auth-service-ci`
  - [ ] `evaluation-service-ci`
  - [ ] `flag-service-ci`
  - [ ] `targeting-service-ci`
  - [ ] `analytics-service-ci`
- [ ] Confirmar gates sem bypass (lint/test/SAST/SCA)
- [ ] Confirmar push no ECR para os 5 servicos
- [ ] Padronizar tag de imagem (`<service>:<sha-curto>`)
- [ ] Evidenciar bloqueio por vulnerabilidade critica
- [ ] Coletar evidencia de pipeline falhando e depois passando

## 4) Epico 3 - GitOps e ArgoCD

- [ ] Definir repositorio/pasta GitOps oficial
- [ ] Instalar ArgoCD no EKS
- [ ] Configurar Applications para os 5 servicos
- [ ] Habilitar autosync (prune/self-heal)
- [ ] Integrar CI para atualizar tag no GitOps
- [ ] Validar sync automatico ponta a ponta

## 5) Entregaveis obrigatorios da Fase 3

- [ ] 5 pipelines verdes com execucao comprovada
- [ ] 5 imagens no ECR com tag de commit
- [ ] Evidencia do gate de seguranca bloqueando PR/build
- [ ] Documentacao curta de operacao e diagnostico de falhas

## 6) Checklist de demonstracao (roteiro de video)

- [ ] Mostrar `docker-compose up` e todos os containers locais
- [ ] Mostrar cluster EKS em estado Active + nodes
- [ ] Mostrar `kubectl get pods` com status Running
- [ ] Mostrar requisicao funcionando (curl/Postman)
- [ ] Mostrar HPA escalando durante teste de carga
- [ ] Mostrar DynamoDB com dados persistidos
- [ ] Explicar arquitetura de microsservicos
- [ ] Explicar uso da LabRole no contexto AWS Academy
- [ ] Explicar papel de cada banco (RDS, Redis, DynamoDB)

## 7) Evidencias a anexar no final

- [ ] Prints/links dos workflows verdes
- [ ] URI + tags das imagens no ECR
- [ ] Print do bloqueio de seguranca (gate)
- [ ] Print do ArgoCD sincronizando
- [ ] Print/video curto do autoscaling (HPA)
