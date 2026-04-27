# Roteiro Fase 3 - Organizado por Epico

Este roteiro segue os requisitos oficiais do Tech Challenge e marca com check tudo que ja foi concluido.

## Premissas de ambiente (AWS Academy x Conta Pessoal)

- [x] Regra documentada: em AWS Academy nao criar IAM Roles/Policies via Terraform
- [x] Uso de LabRole para EKS e Node Groups considerado no projeto
- [x] Alternativa documentada: em conta pessoal e permitido criar IAM via Terraform

---

## Epico 1 - Infraestrutura como Codigo (Terraform)
**Status geral:** Concluido

### Escopo obrigatorio do epico
- [x] Projeto Terraform organizado em modulos (`network`, `eks`, `data`, `ecr`)
- [x] Networking provisionado por codigo (VPC/Subnets/IGW/Routes)
- [x] Cluster EKS e Node Groups provisionados por codigo
- [x] 3 instancias RDS PostgreSQL provisionadas
- [x] ElastiCache Redis provisionado
- [x] Tabela DynamoDB provisionada
- [x] Fila SQS provisionada
- [x] 5 repositorios ECR provisionados

### Requisito de estado remoto
- [x] `terraform.tfstate` fora do ambiente local (backend remoto S3)
- [x] Backend remoto validado em execucao real

### Automacao e validacao
- [x] Workflow `Terraform Validate Plan` funcionando
- [x] Workflow `Terraform Apply Manual` funcionando
- [x] Workflow `Terraform Destroy Manual` funcionando
- [x] Apply validado com criacao dos recursos principais
- [x] Destroy validado com limpeza completa

---

## Epico 2 - CI + DevSecOps
**Status geral:** Em andamento

### Requisitos de pipeline por microsservico
- [x] Workflows criados para os 5 microsservicos
- [x] Base reutilizavel em `service-ci-base.yml`
- [x] Jobs base definidos: build/test, lint, SAST/SCA, docker
- [x] Pipeline rodando automaticamente em Pull Request
- [x] Pipeline rodando automaticamente em Push na `main`

### Estagios tecnicos obrigatorios
- [x] Build e Unit Test validados nos 5 servicos
- [x] Linter/Static Analysis validados nos 5 servicos
- [x] SCA de dependencias validado nos 5 servicos
- [x] SAST de codigo validado nos 5 servicos
- [x] Regra de bloqueio por vulnerabilidade CRITICA comprovada
- [x] Docker build com scan de imagem (Trivy) validado
- [x] Login no ECR validado
- [x] Push no ECR com tag por hash de commit validado

### Evidencias e entregaveis do epico
- [x] Execucoes recentes dos 5 workflows com sucesso (conforme rodada exibida)
- [x] 5 imagens no ECR com tag padronizada (ex: `<service>:<sha-curto>`)
  - [x] `auth-service:e4de419` (`sha256:55920c0348a449f2c189ebe2e12e2e9f0971f3782ba33d5ee567296476e3a61d`)
  - [x] `evaluation-service:e4de419` (`sha256:4ec09b273cef66b65c2e6589a7aaa2d9b03774fbca3a39d80ea4a0604487e965`)
  - [x] `flag-service:e4de419` (`sha256:de7b70923ef6b376024f316a78e9b716dc72d2ed4b02678c7fc44cbdf5888d6e`)
  - [x] `targeting-service:e4de419` (`sha256:e192de86eb4e65defd332fcc2d38bb420412eda504f030df9e3f459e08d569f2`)
  - [x] `analytics-service:e4de419` (`sha256:8bc16b469866e2eb58324736f339ab609d62ecc83006073c8ac62e20aa6a640c`)
- [x] Evidencia de falha do gate de seguranca e posterior correcao
- [x] Documentacao curta de execucao e leitura de falhas (`docs/epico2-ci-devsecops-operacao.md`)

### Observacoes
- Build/Lint/Test/SAST/SCA podem ser executados sem AWS ativa
- Push para ECR depende de AWS ativa e credenciais validas

---

## Epico 3 - CD + GitOps (ArgoCD)
**Status geral:** Nao iniciado

### Requisitos obrigatorios
- [ ] Repositorio (ou pasta) GitOps definido com manifestos/Helm
- [ ] ArgoCD instalado no EKS
- [ ] ArgoCD configurado para os 5 microsservicos
- [ ] CI atualizando automaticamente a tag da imagem no repositorio GitOps
- [ ] ArgoCD monitorando repositório GitOps e sincronizando automaticamente
- [ ] Sync ponta a ponta comprovado na interface do ArgoCD

---

## Entregaveis finais da Fase 3

### 1) Video de demonstracao (ate 20 min)
- [ ] IaC: mostrar `terraform plan` + `terraform apply` (ou recursos finais na AWS)
- [ ] DevSecOps: demonstrar pipeline falhando em seguranca e depois passando
- [ ] GitOps: mostrar pipeline atualizando tag no repositório GitOps
- [ ] ArgoCD: mostrar deteccao e sincronizacao automatica da nova versao

### 2) Codigo fonte no repositorio
- [x] Codigo Terraform estruturado e componentizado
- [x] Workflows CI em `.github/workflows` com esteira base implementada
- [ ] Manifestos Kubernetes ajustados para modelo GitOps

### 3) Relatorio de entrega (PDF ou TXT)
- [ ] Nomes dos participantes
- [ ] Link da documentacao e do video
- [ ] Resumo dos desafios e decisoes tecnicas
- [ ] Print da estimativa de custos AWS
