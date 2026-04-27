# Roteiro Fase 3 com Status

## 1) Epico 1 - Terraform e Infra (Precisa da AWS: SIM)

- [x] Estrutura Terraform modular criada (`network`, `eks`, `data`, `ecr`)
- [x] Backend remoto S3 configurado e validado
- [x] Workflow `Terraform Validate Plan` funcionando
- [x] Workflow `Terraform Apply Manual` funcionando
- [x] Workflow `Terraform Destroy Manual` funcionando
- [x] Apply validado com recursos criados:
  - [x] EKS
  - [x] 3x RDS
  - [x] ElastiCache Redis
  - [x] DynamoDB
  - [x] SQS
  - [x] 5x ECR
- [x] Destroy validado com limpeza completa dos recursos

## 2) Epico 2 - CI DevSecOps (Precisa da AWS: PARCIAL)

- [x] Estrutura inicial pronta:
  - [x] Workflows separados criados para os 5 servicos
  - [x] Base reutilizavel criada em `service-ci-base.yml`
  - [x] Jobs base definidos (build/test, lint, SAST/SCA, docker)
- [ ] Validacao tecnica (ainda nao concluida):
  - [ ] Rodar pipeline de cada servico e corrigir falhas especificas
  - [ ] Confirmar push no ECR para os 5 servicos
  - [ ] Confirmar bloqueio por vulnerabilidade critica com evidencias
  - [ ] Padronizar naming/tag das imagens (`<service>:<sha-curto>`)

### Divisao sugerida - 4 pessoas (mais equilibrada)

- [ ] Pessoa 1 - Go Pipelines
  - [ ] Validar e ajustar `auth-service-ci`
  - [ ] Validar e ajustar `evaluation-service-ci`
  - [ ] Garantir lint/test/gosec/trivy sem bypass

- [ ] Pessoa 2 - Python Pipelines
  - [ ] Validar e ajustar `flag-service-ci`
  - [ ] Validar e ajustar `targeting-service-ci`
  - [ ] Validar e ajustar `analytics-service-ci`

- [ ] Pessoa 3 - DevSecOps Gates e Qualidade
  - [ ] Revisar severidades e regra de bloqueio em `service-ci-base.yml`
  - [ ] Criar cenario de falha intencional para demo (vulnerabilidade/erro)
  - [ ] Coletar evidencias de pipeline falhando e depois passando

- [ ] Pessoa 4 - Build/Push e Integracao com ECR
  - [ ] Validar login ECR e push para os 5 servicos
  - [ ] Padronizar variaveis/secrets no GitHub Actions
  - [ ] Checar nomenclatura final e rastreabilidade das tags

### Divisao sugerida - 3 pessoas (se precisar reduzir)

- [ ] Pessoa 1: Go (`auth` + `evaluation`)
- [ ] Pessoa 2: Python (`flag` + `targeting` + `analytics`)
- [ ] Pessoa 3: DevSecOps + ECR + evidencias de demonstracao

### Entregaveis do Epico 2

- [ ] 5 pipelines verdes com execucao comprovada
- [ ] 5 imagens no ECR com tag de commit
- [ ] evidencia de gate de seguranca bloqueando PR/build
- [ ] documentacao curta de como rodar e interpretar falhas

Observacao:
- Build/Lint/Test/SAST/SCA podem ser trabalhados sem AWS ativa.
- Push no ECR exige AWS ativa e credenciais validas.

## 3) Epico 3 - GitOps e ArgoCD (Precisa da AWS: SIM)

- [ ] Definir repositorio/pasta GitOps oficial
- [ ] Instalar ArgoCD no EKS
- [ ] Configurar Applications para os 5 servicos
- [ ] Habilitar autosync (prune/self-heal)
- [ ] Integrar CI para atualizar tag no GitOps
- [ ] Validar sync automatico ponta a ponta
