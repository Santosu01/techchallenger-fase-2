Aqui está o seu roteiro completo **revisado, refinado e otimizado**.

Foram integradas as correções sobre o **AWS Academy** (evitando termos confusos e usando a linguagem técnica correta de IAM), incluída a citação ao módulo **`ecr`**, a menção ao **Backend Remoto no S3**, e polidas as falas para que fiquem extremamente naturais, confiáveis e impactantes para a banca examinadora.

---

# 🎬 ROTEIRO DE APRESENTAÇÃO - TECH CHALLENGE FASE 3

## 📌 ToggleMaster: IaC, DevSecOps & GitOps

---

## ⏱️ [00:00 - 02:00] INTRODUÇÃO & VISÃO GERAL

### 🎬 O que fazer no vídeo:

* Mostrar a câmera dos integrantes ou a tela inicial da documentação / repositório principal no GitHub.

### 🎙️ Fala sugerida:

> *"Olá a todos! Sejam muito bem-vindos à apresentação do nosso Tech Challenge da Fase 3, desenvolvido pelo Grupo 13. Meu nome é Ana Letícia e vou guiar vocês pela demonstração prática da nossa infraestrutura, segurança e fluxo de entrega contínua.*
> *Nesta fase, o nosso objetivo foi transformar o **ToggleMaster** — que é um sistema robusto de gerenciamento de Feature Flags composto por 5 microsserviços — em um ecossistema moderno orientado às melhores práticas absolutas de mercado: **Infraestrutura como Código (IaC)**, **Segurança DevSecOps Integrada** e **implantação declarativa utilizando GitOps**.*
> *Para isso, desenhamos uma arquitetura escalável e imutável que garante que cada alteração passe por rigorosos testes de segurança automatizados antes de chegar ao nosso cluster de produção, eliminando qualquer intervenção manual na nuvem. Vamos ver como isso foi construído na prática!"*

---

## ⏱️ [02:00 - 06:00] PARTE 1: INFRAESTRUTURA COMO CÓDIGO (IaC)

### 🎬 O que fazer no vídeo:

1. Abra o **VS Code**.
2. Mostre a estrutura de pastas expandida no menu lateral esquerdo (destacando a pasta `infra/terraform` e a subpasta `modules`).
3. Clique no arquivo `infra/terraform/providers.tf` para mostrá-lo na tela.
4. Transicione para o navegador e navegue pelo **Console AWS** (mostre a aba da VPC, as instâncias do RDS e o cluster EKS ativo).

### 🎙️ Fala sugerida:

> *(Mostrando as pastas no VS Code)*: *"Começando pela base de tudo: a nossa infraestrutura. Nós utilizamos o **Terraform** para provisionar toda a nossa arquitetura na AWS. Organizamos o nosso código utilizando o conceito de **Módulos do Terraform**, o que nos garante isolamento de escopo, organização e alta reutilização de código.*
> *Como podemos ver na árvore de diretórios, estruturamos o projeto em quatro módulos principais:*
> * *O módulo `network`, que cria toda a nossa rede VPC, subnets públicas e privadas distribuídas em múltiplas zonas de disponibilidade, além de Gateways e tabelas de rotas isoladas.*
> * *O módulo `data`, responsável pelos nossos componentes de dados persistentes: são três instâncias do RDS PostgreSQL para os microsserviços de autenticação, flags e targeting; uma tabela DynamoDB sob demanda para o analytics; e uma fila SQS para a nossa mensageria assíncrona.*
> * *O módulo `eks`, que gerencia e encapsula o nosso cluster Kubernetes e seus respectivos Node Groups.*
> * *E o módulo `ecr`, onde automatizamos a criação dos repositórios do Amazon ECR para armazenar de forma segura os artefatos e imagens Docker de cada um dos nossos 5 microsserviços.*
> 
> 
> *(Mostrando o arquivo `providers.tf`)*: *Aqui no arquivo `providers.tf`, configuramos uma premissa fundamental de DevOps cooperativo: o **Backend Remoto utilizando um bucket S3** para o armazenamento seguro do arquivo de estado, o `terraform.tfstate`. Isso garante que o estado da infraestrutura fique centralizado e protegido na nuvem, permitindo colaboração concorrente segura sem riscos de conflito ou corrupção de dados local.*
> *(Explicando a restrição e o contorno do AWS Academy)*: *Um ponto crucial do projeto: como estamos utilizando o ambiente acadêmico do **AWS Academy**, estamos sujeitos à restrição de não podermos criar novas IAM Roles ou Policies personalizadas. Para contornar isso com total maestria técnica e aderir estritamente à 'Opção A' do desafio, configuramos o Terraform para herdar dinamicamente a **LabRole** pré-existente do laboratório, associando-a tanto ao Cluster EKS quanto aos Node Groups.*
> *(Mostrando a AWS no Navegador)*: *Por conta dessas limitações nativas de permissão do usuário estudante, alguns avisos visuais de erro podem aparecer no console da AWS, mas, como vocês podem ver aqui na tela, a nossa VPC, os repositórios do ECR, os bancos RDS e o nosso cluster EKS foram provisionados com sucesso via código e estão 100% operacionais. Agora, vamos ver como garantimos a segurança de ponta a ponta dos nossos serviços."*

---

## ⏱️ [06:00 - 12:00] PARTE 2: PIPELINE DEVSECOPS (CENÁRIO DE FALHA E CORREÇÃO)

### 🎬 O que fazer no vídeo (Fase A - Provocando a Falha):

1. No VS Code, abra o arquivo `backend-services/auth-service/Dockerfile`.
2. Vá até a linha da imagem base (ex: `FROM alpine:3.19`).
3. Altere para uma imagem antiga e vulnerável (recomendamos usar `alpine:3.12` para que os comandos do Alpine continuem funcionando sem quebrar o build do container, falhando apenas no escaneamento de segurança):
```dockerfile
FROM alpine:3.12
```


4. Salve o arquivo.
5. Abra o terminal integrado do VS Code e execute os comandos de Git:
```powershell
git add backend-services/auth-service/Dockerfile
git commit -m "test: forcar erro de seguranca no container"
git push origin Fase3

```


6. Vá para o navegador na página do seu repositório no GitHub, clique na aba **Actions** e selecione o workflow que começou a rodar (`Auth Service CI`).
7. Mostre o andamento do pipeline até ele chegar na etapa de **Container Scan** (ou similar) e **falhar (ficar com o X vermelho)**.

### 🎙️ Fala sugerida (Fase A - Provocando a Falha):

> *"Para demonstrar como a nossa esteira de DevSecOps atua como uma barreira de segurança contínua, vou simular um cenário real de falha crítica injetando uma vulnerabilidade no nosso microsserviço de autenticação. Adotamos o modelo de segurança Shift-Left, capturando ameaças no início do ciclo, muito antes do deploy.*
> *Aqui no `Dockerfile` do `auth-service`, vou alterar a nossa imagem base segura de execução de `alpine:3.19` para uma imagem legada e sabidamente insegura, como a `alpine:3.12`.*
> *(Executando o push no terminal)*: *Vou commitar essa alteração e enviá-la para a nossa branch de trabalho.*
> *(Mostrando o GitHub Actions no navegador)*: *Como podemos ver, o GitHub Actions identificou o push e disparou automaticamente o pipeline. A nossa esteira foi projetada para rodar etapas rigorosas:*
> * *Primeiro, valida a compilação do código e os testes unitários.*
> * *Depois, executa ferramentas de linting para garantir a qualidade de estilo e boas práticas.*
> * *Em seguida, entra a análise estática de segurança (SAST) analisando o código-fonte, e a análise de composição de software (SCA) inspecionando dependências de terceiros com o Trivy FS.*
> 
> 
> *Após passar pelo build da imagem Docker, chegamos na etapa crucial de **Container Scan**. O Trivy inspeciona as camadas da imagem gerada e, como utilizamos a base desatualizada do `alpine:3.12` (que possui vulnerabilidades críticas conhecidas), o scanner detecta essas falhas, retorna um código de erro e **bloqueia imediatamente a esteira**, impedindo o push desse artefato inseguro para o Amazon ECR. O pipeline funcionou exatamente como projetado, blindando o nosso ambiente!"*

---

### 🎬 O que fazer no vídeo (Fase B - Corrigindo a Falha):

1. Volte ao VS Code no arquivo `backend-services/auth-service/Dockerfile`.
2. Reverta a linha de volta para o padrão seguro:
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

> *"Agora que provamos a eficácia do nosso bloqueio automatizado, vamos aplicar a correção. Voltando ao `Dockerfile`, vou reverter a imagem base para a versão recomendada, leve e altamente segura baseada em `alpine:3.19`.*
> *(Executando o push no terminal)*: *Vou salvar, criar um novo commit de correção e enviar ao repositório.*
> *(Mostrando o GitHub Actions verde)*: *Podemos ver que a nova execução do pipeline foi iniciada. Desta vez, utilizando uma imagem de base limpa, a etapa de **Container Scan** do Trivy é concluída com sucesso sem encontrar nenhuma vulnerabilidade impeditiva. Com o artefato perfeitamente validado, a esteira libera a etapa final de **Push ECR**, publicando a imagem gerada com a tag exclusiva baseada no hash do commit diretamente na AWS. Tudo de forma 100% automatizada e segura."*

---

## ⏱️ [12:00 - 17:00] PARTE 3: GITOPS COM ARGOCD

### 🎬 O que fazer no vídeo:

1. Abra o navegador na aba do **ArgoCD**.
2. Mostre os aplicativos gerenciados na tela principal (os microsserviços do projeto).
3. Clique em um deles (ex: `auth-service`) para mostrar a árvore visual de pods, replica-sets e services conectados na tela.
4. Abra o terminal do VS Code e digite o comando para provar a saúde dos recursos direto no cluster:
```powershell
kubectl get pods -n togglemaster

```



### 🎙️ Fala sugerida:

> *(Mostrando a tela principal do ArgoCD)*: *"Com as imagens validadas e publicadas de forma segura no ECR, chegamos ao coração da nossa estratégia de entrega contínua: o **GitOps utilizando o ArgoCD**.*
> *Para garantir a imutabilidade do ambiente, abolimos totalmente as implantações manuais ou comandos diretos de alteração no cluster. Adotamos o modelo puramente declarativo. Como vocês podem ver aqui na interface do ArgoCD, temos as aplicações criadas e monitoradas ativamente, representando cada um dos microsserviços do ecossistema ToggleMaster: `auth`, `flag`, `targeting`, `evaluation` e `analytics`.*
> *(Mostrando a árvore do auth-service)*: *Ao inspecionarmos o `auth-service`, temos uma visão clara e detalhada de toda a arquitetura de recursos do Kubernetes. O ArgoCD monitora o nosso repositório Git focado nos manifestos. Assim que o nosso pipeline de CI atualiza a tag da nova imagem lá no Git, o ArgoCD detecta instantaneamente que o cluster real ficou fora de sincronia em relação ao repositório e inicia o processo de reconciliação automatizada (`Self-Heal`), atualizando os pods para a nova versão sem gerar indisponibilidade.*
> *(Mostrando o terminal)*: *Se executarmos um `kubectl get pods -n togglemaster` aqui no nosso terminal, podemos validar que todos os componentes e microsserviços encontram-se em estado saudável, distribuídos e rodando com alta disponibilidade no Amazon EKS. Isso nos fornece rastreabilidade absoluta: se uma configuração não está documentada e versionada no código do Git, ela simplesmente não existe no nosso ambiente de nuvem."*

---

## ⏱️ [17:00 - 18:00] CONCLUSÃO

### 🎬 O que fazer no vídeo:

* Volte a câmera para os integrantes ou mostre a tela de encerramento com o repositório/slides finais do grupo.

### 🎙️ Fala sugerida:

> *"Com isso, concluímos a demonstração completa do nosso Tech Challenge da Fase 3. Ao longo dessa apresentação, pudemos comprovar a consolidação de três grandes pilares modernos:*
> * *1. Uma infraestrutura robusta, resiliente e 100% modularizada via Terraform na AWS, utilizando estado remoto gerenciado.*
> * *2. Uma esteira rigorosa de DevSecOps que atua ativamente aplicando segurança Shift-Left e bloqueando ameaças automaticamente em tempo de build.*
> * *3. E um fluxo de deploy moderno e elegante baseado em GitOps com ArgoCD, garantindo auditoria e sincronização contínua do cluster.*
> 
> 
> *Essa abordagem elimina gargalos de deploys manuais, reduz drasticamente o risco de erros operacionais e garante que o sistema ToggleMaster opere em um ambiente altamente escalável, auditável e extremamente seguro. Muito obrigado a todos pela atenção!"*