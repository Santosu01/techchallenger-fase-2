# 🎬 ROTEIRO DE APRESENTAÇÃO - TECH CHALLENGE FASE 3
## 📌 ToggleMaster: IaC, DevSecOps & GitOps

---

## ⏱️ [00:00 - 02:00] INTRODUÇÃO & VISÃO GERAL

### 🎬 O que fazer no vídeo:
* Mostrar a câmera dos integrantes ou a tela inicial da documentação / repositório no GitHub.

### 🎙️ Fala sugerida:
> *"Olá a todos! Sejam muito bem-vindos à apresentação do nosso Tech Challenge da Fase 3 do grupo ToggleMaster. Meu nome é Ana Letícia e vou guiar vocês pela demonstração prática da nossa infraestrutura, segurança e fluxo de entrega contínua.*
>
> *Nesta fase, o nosso objetivo foi transformar o **ToggleMaster** — que é um sistema robusto de gerenciamento de Feature Flags composto por 5 microsserviços — em um ecossistema moderno orientado às melhores práticas de mercado: **Infraestrutura como Código**, **Segurança DevSecOps Integrada** e **implantação declarativa com GitOps**.*
>
> *Para isso, desenhamos uma arquitetura escalável e imutável que garante que cada alteração passe por rigorosos testes de segurança antes de chegar ao nosso cluster de produção, sem qualquer intervenção manual na nuvem. Vamos ver isso na prática!"*

---

## ⏱️ [02:00 - 06:00] PARTE 1: INFRAESTRUTURA COMO CÓDIGO (IaC)

### 🎬 O que fazer no vídeo:
1. Abra o **VS Code**.
2. Mostre a pasta `infra/terraform` aberta no menu lateral esquerdo.
3. Clique no arquivo `infra/terraform/providers.tf` para mostrá-lo na tela.
4. Abra a aba do seu navegador e mostre o **Console AWS** (exiba o cluster EKS ativo e o RDS).

### 🎙️ Fala sugerida:
> *(Mostrando as pastas no VS Code)*: *"Começando pela base de tudo: a nossa infraestrutura. Nós utilizamos o **Terraform** para provisionar toda a nossa arquitetura na AWS. Organizamos o nosso código utilizando o conceito de **Módulos do Terraform**, o que nos dá isolamento de código e alta reutilização.*
>
> *Temos três módulos principais no diretório `modules`:*
> * *O módulo `network`, que cria toda a nossa rede VPC, subnets públicas e privadas distribuídas em múltiplas zonas de disponibilidade, além de Gateways e tabelas de rotas isoladas.*
> * *O módulo `data`, responsável pelos nossos bancos de dados persistentes: são três instâncias do RDS PostgreSQL para os microsserviços de autenticação, flags e targeting; uma tabela DynamoDB sob demanda para o analytics; e uma fila SQS para mensageria assíncrona.*
> * *E o módulo `eks`, que gerencia e encapsula o nosso cluster Kubernetes.*
>
> *(Mostrando o arquivo `providers.tf`)*: *Aqui no arquivo `providers.tf`, configuramos uma excelente prática de DevOps cooperativo: o **Remote State usando um bucket S3 como Backend**. Isso garante que o estado da infraestrutura fique centralizado e seguro na nuvem, permitindo que vários membros da equipe colaborem de forma concorrente sem o risco de conflitos ou corrupção de estado.*
>
> *(Explicando a restrição e o contorno)*: *Como estamos utilizando o ambiente restrito do **AWS Academy**, que bloqueia a criação de Roles de segurança personalizadas por estudantes, contornamos essa limitação com maestria técnica: configuramos o Terraform para herdar dinamicamente as roles existentes no laboratório (`LabEksClusterRole` e `LabEksNodeRole`), viabilizando a criação do cluster Kubernetes sem violar as políticas de segurança da plataforma.*
>
> *(Mostrando a AWS no Navegador)*: *Aqui no console da AWS, podemos ver nossa VPC ativa, os 3 bancos RDS criados e o nosso cluster EKS ativo e saudável, pronto para rodar nossos microsserviços. Agora, vamos ver como garantimos que o código dos nossos serviços chegue até aqui com total segurança."*

---

## ⏱️ [06:00 - 12:00] PARTE 2: PIPELINE DEVSECOPS (CENÁRIO DE FALHA E CORREÇÃO)

### 🎬 O que fazer no vídeo (Fase A - Provocando a Falha):
1. No VS Code, abra o arquivo `backend-services/auth-service/Dockerfile`.
2. Vá até a **linha 19** (`FROM alpine:3.19`).
3. Altere de:
   ```dockerfile
   FROM alpine:3.19
   ```
   Para uma imagem antiga e vulnerável:
   ```dockerfile
   FROM ubuntu:16.04
   ```
4. Salve o arquivo.
5. Abra o terminal integrado do VS Code e execute os comandos exatos de Git:
   ```powershell
   git add backend-services/auth-service/Dockerfile
   git commit -m "test: forcar erro de seguranca no container"
   git push origin Fase3
   ```
6. Vá para o navegador na página do seu repositório no GitHub, clique na aba **Actions** e selecione o workflow que começou a rodar (`Auth Service CI`).
7. Mostre o andamento do pipeline até ele chegar na etapa de **Container Scan** e **falhar (ficar com o X vermelho)**.

### 🎙️ Fala sugerida (Fase A - Provocando a Falha):
> *"Para demonstrar como a nossa esteira de DevSecOps atua como uma barreira de segurança contínua, vou simular um cenário de falha crítica inserindo uma vulnerabilidade no nosso microsserviço de autenticação. O nosso pipeline integra segurança no modelo Shift-Left, detectando ameaças antes mesmo do deploy.*
>
> *Aqui no arquivo `backend-services/auth-service/Dockerfile`, vou alterar a nossa imagem base segura de execução de `alpine:3.19` para uma imagem legada e sabidamente insegura, como a `ubuntu:16.04`.*
>
> *(Executando o push no terminal)*: *Agora vou commitar essa alteração e enviar diretamente para a nossa branch de homologação `Fase3`.*
>
> *(Mostrando o GitHub Actions no navegador)*: *Como vocês podem ver, o GitHub Actions identificou o push e disparou automaticamente o pipeline do `auth-service`. A nossa esteira roda etapas rigorosas:*
> * *Primeiro, valida a compilação e roda os testes unitários (`Build and Test`).*
> * *Depois, executa o linter para garantir a qualidade de estilo.*
> * *Em seguida, roda o SAST usando o Gosec para analisar vulnerabilidades direto no código Go.*
> * *E o SCA no sistema de arquivos usando o Trivy FS para analisar vulnerabilidades em pacotes de terceiros.*
>
> *Após passar por essas etapas, ele gera a imagem Docker. E é agora, no **Container Scan**, que o Trivy analisa a imagem final gerada. Como usamos a base `ubuntu:16.04` (que possui dezenas de vulnerabilidades críticas conhecidas), o Trivy encontrou brechas de segurança, retornou o código de erro 1 e **bloqueou imediatamente a esteira**, impedindo que essa imagem insegura fosse enviada ao nosso repositório ECR na AWS. A esteira funcionou exatamente como projetado, protegendo o nosso ambiente!"*

---

### 🎬 O que fazer no vídeo (Fase B - Corrigindo a Falha):
1. Volte ao VS Code no arquivo `backend-services/auth-service/Dockerfile`.
2. Reverta a **linha 19** de volta para o padrão seguro:
   ```dockerfile
   FROM alpine:3.19
   ```
3. Salve o arquivo.
4. No terminal, execute os comandos para salvar e enviar a correção:
   ```powershell
   git add backend-services/auth-service/Dockerfile
   git commit -m "fix: restaurar imagem base segura alpine"
   git push origin Fase3
   ```
5. Volte ao navegador no **GitHub Actions** e aguarde o novo pipeline rodar.
6. Mostre todas as etapas passando com o **check verde ✅**, incluindo o **Container Scan** e o **Push ECR** bem-sucedidos.

### 🎙️ Fala sugerida (Fase B - Corrigindo a Falha):
> *"Agora que provamos a eficácia do bloqueio, vamos aplicar a correção definitiva. Voltando ao `Dockerfile` do serviço de autenticação, vou reverter a imagem base para a versão original recomendada e altamente segura, baseada em `alpine:3.19`.*
>
> *(Executando o push no terminal)*: *Vou salvar, commitar e enviar esta correção de segurança.*
>
> *(Mostrando o GitHub Actions verde)*: *Podemos ver que uma nova execução do pipeline foi iniciada. Desta vez, com a imagem limpa e segura do Alpine, a etapa de **Container Scan** do Trivy executou com sucesso sem encontrar vulnerabilidades críticas. Com a imagem validada e limpa, o pipeline liberou a etapa de **Push ECR**, enviando com segurança o nosso novo artefato autenticado diretamente para o repositório privado na AWS de forma 100% automatizada."*

---

## ⏱️ [12:00 - 17:00] PARTE 3: GITOPS COM ARGOCD

### 🎬 O que fazer no vídeo:
1. Abra o navegador na aba do **ArgoCD** (`https://localhost:8080/applications`).
2. Mostre os **6 blocos/aplicativos** na tela principal (`cluster-config` + os 5 microsserviços).
3. Clique em um deles (ex: `auth-service`) para mostrar a árvore completa de pods, replica-sets e services conectados na tela de forma visual.
4. Abra o terminal do VS Code e digite o comando para provar que está rodando no EKS:
   ```powershell
   kubectl get pods -n togglemaster
   ```

### 🎙️ Fala sugerida:
> *(Mostrando a tela principal do ArgoCD)*: *"Com as imagens validadas e publicadas com segurança no ECR, chegamos ao coração da nossa entrega contínua: o **GitOps utilizando o ArgoCD**.*
>
> *Nós não realizamos nenhuma implantação manual e não executamos comandos brutos dentro do cluster. Adotamos o modelo declarativo. Como vocês podem ver aqui na interface do ArgoCD, temos 6 aplicações criadas e monitoradas:*
> * *A aplicação `cluster-config` gerencia as configurações globais do cluster, como namespaces, Ingress Controllers, ConfigMaps e Secrets.*
> * *E as outras 5 aplicações gerenciam cada um dos nossos microsserviços do ToggleMaster: `auth`, `flag`, `targeting`, `evaluation` e `analytics`.*
>
> *(Mostrando a árvore do auth-service)*: *Se eu clicar em `auth-service`, vejam como a visualização é incrível. O ArgoCD monitora ativamente o repositório Git na nossa branch `Fase3`. Quando alteramos qualquer arquivo de configuração no Git, o ArgoCD detecta imediatamente que o cluster está "Fora de Sincronia" (Out of Sync) e inicia o processo de autocorreção (Self-Heal), sincronizando os manifestos para que o estado real do Kubernetes reflita perfeitamente o estado declarado no Git.*
>
> *(Mostrando o terminal)*: *E se eu executar no terminal local um `kubectl get pods -n togglemaster`, podemos ver que todos os containers estão saudáveis, distribuídos e rodando em produção na nuvem da AWS. Isso nos traz rastreabilidade absoluta: tudo o que está rodando em produção está documentado no Git!"*

---

## ⏱️ [17:00 - 18:00] CONCLUSÃO

### 🎬 O que fazer no vídeo:
* Volte a câmera para os participantes ou mostre a tela de encerramento do slide/repositório.

### 🎙️ Fala sugerida:
> *"Com isso, concluímos com sucesso a demonstração do nosso Tech Challenge Fase 3. Nós conseguimos estabelecer:*
> * *1. Uma infraestrutura 100% automatizada e modularizada com Terraform remoto na AWS.*
> * *2. Uma barreira sólida de DevSecOps que bloqueia automaticamente vulnerabilidades em tempo de integração contínua (CI).*
> * *3. Uma implantação de alta disponibilidade declarativa com GitOps e ArgoCD sincronizando nosso cluster EKS.*
>
> *Essa arquitetura reduz drasticamente o risco de erros humanos e garante que o nosso sistema ToggleMaster seja estável, altamente escalável e extremamente seguro. Muito obrigado a todos pela atenção!"*
