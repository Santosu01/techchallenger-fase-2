# Relatório de Entrega - Tech Challenge Fase 3

## Dados do Grupo
- **Integrantes:** [NOME DOS PARTICIPANTES]
- **Link do Vídeo:** [URL DO YOUTUBE/VIMEO]
- **Repositório:** [URL DO REPOSITÓRIO GITHUB]

## 1. Desafios Encontrados

Durante o desenvolvimento da Fase 3, os principais desafios foram:

1.  **Restrições do AWS Academy:** A impossibilidade de criar permissões de IAM via código exigiu uma adaptação significativa no Terraform. Tivemos que utilizar a `LabRole` pré-existente e garantir que todos os serviços (EKS, RDS, Node Groups) estivessem corretamente associados a ela via `data sources` e variáveis.
2.  **Orquestração de Pipelines:** Gerenciar o ciclo de vida de 5 microsserviços de forma independente, mas padronizada. O desafio foi garantir que as verificações de segurança (SAST/SCA) fossem rigorosas o suficiente para bloquear vulnerabilidades críticas sem gerar falsos positivos excessivos que travassem o desenvolvimento.
3.  **Implementação de GitOps:** A transição do modelo de "push" (kubectl apply no CI) para o modelo de "pull" (ArgoCD monitorando o Git) exigiu a criação de um passo adicional no pipeline para atualizar automaticamente os manifestos, garantindo a sincronia entre o código e o ambiente.
4.  **Gestão de Estado da Infraestrutura:** A configuração do backend remoto S3 para o Terraform foi essencial para evitar conflitos de estado (state locks), garantindo que a infraestrutura imutável fosse mantida corretamente.

## 2. Decisões Tomadas

Para superar os desafios e entregar uma solução robusta, tomamos as seguintes decisões:

1.  **Terraform Modularizado:** Organizamos o código de infraestrutura em módulos independentes. Isso permitiu testar a rede (VPC) separadamente dos bancos de dados e do cluster, facilitando o debug.
2.  **Workflows Reutilizáveis (GitHub Actions):** Criamos um `service-ci-base.yml` que encapsula toda a lógica de Build, Lint, Security Scans e Docker Push. Isso garante que qualquer melhoria na segurança seja aplicada instantaneamente aos 5 microsserviços.
3.  **Segurança em Camadas (DevSecOps):** Implementamos três níveis de varredura:
    - **Gosec/Bandit:** Verificação do código fonte (SAST).
    - **Trivy FS:** Verificação de dependências no sistema de arquivos (SCA).
    - **Trivy Image:** Verificação de vulnerabilidades dentro da imagem Docker final.
4.  **Uso de Commit SHA para Tagging:** Todas as imagens são versionadas com o Hash do commit. Isso evita o uso da tag `latest`, que é considerada má prática em Kubernetes, e garante que o ArgoCD sempre identifique uma nova versão para sincronizar.
5.  **ArgoCD para Continuous Deployment:** Escolhemos o ArgoCD pela sua interface visual clara e capacidade de auto-healing, garantindo que, se alguém alterar algo manualmente no cluster, o ArgoCD reverta para o estado definido no Git.

## 3. Estimativa de Custos AWS

Conforme solicitado, a estimativa de custos para este ambiente (considerando região us-east-1) é:

- **EKS:** ~$73/mês (Cluster) + instâncias t3.medium.
- **RDS (3 instâncias db.t3.micro):** ~$45/mês.
- **ElastiCache (Redis):** ~$15/mês.
- **S3/DynamoDB/SQS:** Custos mínimos dentro do Free Tier ou uso leve.
*(Nota: No ambiente Academy, esses custos são cobertos pelos créditos do laboratório).*
