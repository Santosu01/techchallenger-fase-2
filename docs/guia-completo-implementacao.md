# ToggleMaster - Guia de Deploy Cloud

## Tech Challenge Fase 2 - POSECH Tech

Este guia detalha os passos para deploy em cloud (Kubernetes/EKS), considerando que o ambiente local (Docker Compose) já está funcionando.

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOGGLEMASTER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Service │  │Flag Service  │  │ Targeting    │          │
│  │    (Go)      │  │   (Python)   │  │  (Python)    │          │
│  │  + Postgres  │  │  + Postgres  │  │  + Postgres  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Evaluation   │  │  Analytics   │                            │
│  │   (Go)       │  │   (Python)   │                            │
│  │   + Redis    │  │  + DynamoDB  │                            │
│  └──────────────┘  └──────────────┘                            │
│                          + SQS                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sumário

| Etapa | Descrição             | Onde                            |
| ----- | --------------------- | ------------------------------- |
| 1     | Imagens Docker & ECR  | AWS ECR                         |
| 2     | Infraestrutura AWS    | RDS, ElastiCache, DynamoDB, SQS |
| 3     | Kubernetes (EKS)      | Cluster EKS                     |
| 4     | Testes e Validação    | Validação completa              |
| 5     | Vídeo de Apresentação | Demonstração                    |

---

## ETAPA 1: Imagens Docker & Amazon ECR

### 1.1. Criar Repositórios no ECR

1. Acesse o console AWS
2. Pesquise por **ECR** (Elastic Container Registry)
3. Vá para **Private registry** > **Repositories**
4. Clique em **Create repository**
5. Crie os 5 repositórios:

| Nome do Repositório |
| ------------------- |
| auth-service        |
| flag-service        |
| targeting-service   |
| evaluation-service  |
| analytics-service   |

### 1.2. Autenticar no ECR

```bash
# Substitua <SEU_ID_ECR> pelo seu ID da AWS (ex: 123456789012)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com
```

### 1.3. Build e Push de Cada Serviço

```bash
# ==================== AUTH SERVICE ====================
cd auth-service
docker build -t auth-service .
docker tag auth-service:latest <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
docker push <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
cd ..

# ==================== FLAG SERVICE ====================
cd flag-service
docker build -t flag-service .
docker tag flag-service:latest <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/flag-service:latest
docker push <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/flag-service:latest
cd ..

# ==================== TARGETING SERVICE ====================
cd targeting-service
docker build -t targeting-service .
docker tag targeting-service:latest <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/targeting-service:latest
docker push <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/targeting-service:latest
cd ..

# ==================== EVALUATION SERVICE ====================
cd evaluation-service
docker build -t evaluation-service .
docker tag evaluation-service:latest <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/evaluation-service:latest
docker push <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/evaluation-service:latest
cd ..

# ==================== ANALYTICS SERVICE ====================
cd analytics-service
docker build -t analytics-service .
docker tag analytics-service:latest <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/analytics-service:latest
docker push <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/analytics-service:latest
cd ..
```

### 1.4. Verificar Imagens no ECR

No console ECR, cada repositório deve mostrar a imagem com tag `latest`.

---

## ETAPA 2: Infraestrutura AWS

Use a região **us-east-1** para todos os recursos.

### 2.1. RDS PostgreSQL (3 Instâncias)

#### Banco 1: auth-db

1. Console AWS > **RDS** > **Create database**
2. Configure:

| Campo                  | Valor                              |
| ---------------------- | ---------------------------------- |
| Engine                 | PostgreSQL                         |
| Engine version         | 13.x                               |
| Template               | Free tier                          |
| DB instance identifier | `togglemaster-auth`                |
| Master username        | `admin`                            |
| Master password        | Defina uma senha forte e **ANOTE** |
| Initial database name  | `auth_db`                          |
| Instance class         | `db.t3.micro`                      |

3. Em **Connectivity**:
   - VPC: Default VPC
   - Public access: **Yes**
   - VPC security group: Criar novo ou usar default
   - Database port: 5432

4. Clique em **Create database**
5. **ANOTE O ENDPOINT** (algo como `togglemaster-auth.xxxx.us-east-1.rds.amazonaws.com`)

#### Banco 2: flags-db

Repita o processo acima com:

| Campo                  | Valor                |
| ---------------------- | -------------------- |
| DB instance identifier | `togglemaster-flags` |
| Initial database name  | `flags_db`           |

#### Banco 3: targeting-db

Repita o processo acima com:

| Campo                  | Valor                    |
| ---------------------- | ------------------------ |
| DB instance identifier | `togglemaster-targeting` |
| Initial database name  | `targeting_db`           |

⏱️ **Tempo estimado:** 10-15 minutos para cada banco ficar disponível.

### 2.2. ElastiCache Redis

1. Console AWS > **ElastiCache** > **Redis** > **Create**

2. Configure:

| Campo              | Valor                |
| ------------------ | -------------------- |
| Cluster name       | `togglemaster-cache` |
| Cluster endpoint   | Desabilitar          |
| Engine version     | 7.x                  |
| Node type          | `cache.t3.micro`     |
| Number of replicas | 0                    |
| Multi-AZ           | No                   |
| Subnet group       | Default              |

3. Em **Security**:
   - Security group: Criar ou usar default
   - Port: 6379

4. Clique em **Create**

5. **ANOTE O ENDPOINT PRIMÁRIO** (algo como `togglemaster-cache.xxxx.use1.cache.amazonaws.com:6379`)

### 2.3. DynamoDB

1. Console AWS > **DynamoDB** > **Create table**

2. Configure:

| Campo                | Valor                   |
| -------------------- | ----------------------- |
| Table name           | `ToggleMasterAnalytics` |
| Partition key        | `requestId` (String)    |
| Sort key             | Deixar vazio            |
| Table capacity class | On-demand               |

3. Clique em **Create table**

### 2.4. SQS

1. Console AWS > **SQS** > **Create queue**

2. Configure:

| Campo      | Valor                          |
| ---------- | ------------------------------ |
| Type       | Standard                       |
| Queue name | `togglemaster-analytics-queue` |

3. Clique em **Create queue**

4. **ANOTE A URL DA FILA** (algo como `https://sqs.us-east-1.amazonaws.com/123456789012/togglemaster-analytics-queue`)

---

## ETAPA 3: Kubernetes (EKS)

### 3.1. Pré-requisitos

- AWS CLI instalado e configurado
- kubectl instalado
- Acesso à console AWS (se aplicável)

### 3.2. Criar Cluster EKS

1. Console AWS > **EKS** > **Create cluster**

2. Em **Configure cluster**:

| Campo                | Valor                             |
| -------------------- | --------------------------------- |
| Name                 | `togglemaster-cluster`            |
| Kubernetes version   | 1.28 ou superior                  |
| Cluster service role | Criar nova role ou usar existente |

3. Em **Specify networking**:

| Campo                   | Valor                      |
| ----------------------- | -------------------------- |
| VPC                     | Default VPC                |
| Cluster endpoint access | Public                     |
| Subnets                 | Selecione TODAS as subnets |

4. Em **Configure observability**:
   - Deixe o padrão

5. Em **Select cluster compute platform** (IMPORTANTE):

**⚠️ RECOMENDADO: Escolha "EKS Auto Mode"**

| Opção | Descrição | Recomendação |
| ----- | --------- | ------------ |
| **EKS Auto Mode** | Provisionamento automático de nós com Karpenter | ✅ RECOMENDADO |
| **Standard** | Node Groups tradicionais | ❌ Não recomendado para AWS Academy |

**Por que EKS Auto Mode?**
- Provisiona nós automaticamente conforme demanda
- Usa Karpenter integrado para escalonamento
- Evita problemas de IMDS (Instance Metadata Service) comuns em AWS Academy
- Nós Bottlerocket com melhor compatibilidade

6. Clique em **Create cluster**

⏱️ **Tempo estimado:** 10-20 minutos

### 3.3. Instalar Add-ons Básicos (ANTES dos nós) ⚠️ OBRIGATÓRIO

**⚠️ IMPORTANTE:** Os add-ons básicos (VPC CNI, CoreDNS, kube-proxy) DEVEM ser instalados **ANTES** que os nós sejam provisionados. Sem eles, os pods não conseguirão se comunicar corretamente.

#### 3.3.0. Ordem Correta de Criação

```
┌─────────────────────────────────────────────────────────────┐
│  ORDEM CORRETA DE CRIAÇÃO DO CLUSTER EKS                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ Criar Cluster EKS com EKS Auto Mode                    │
│         ↓                                                    │
│  2️⃣ Instalar Add-ons BÁSICOS (VPC CNI, CoreDNS, kube-proxy)│
│         ↓                                                    │
│  3️⃣ Conectar kubectl                                        │
│         ↓                                                    │
│  4️⃣ Configurar VPC e Security Groups                        │
│         ↓                                                    │
│  5️⃣ Instalar Metrics Server (para HPA)                     │
│         ↓                                                    │
│  6️⃣ Instalar NGINX Ingress Controller                      │
│         ↓                                                    │
│  7️⃣ Deploy das aplicações                                   │
│         ↓                                                    │
│  8️⃣ Configurar credenciais AWS (via Secret)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.1. Instalar Add-ons pela Interface do Console AWS (RECOMENDADO)

1. Acesse o **Console AWS** > **EKS** > Selecione o cluster `togglemaster-cluster`
2. No menu lateral, clique em **Add-ons**
3. Clique em **Get more add-ons** ou **Add new**
4. Instale os 3 add-ons **OBRIGATÓRIOS** (nesta ordem):

| Ordem | Add-on | Descrição | Quando Instalar |
| ----- | ------ | --------- | --------------- |
| 1º | **Amazon VPC CNI** | Rede de pods na VPC | ⚠️ ANTES dos nós |
| 2º | **CoreDNS** | Resolução de DNS interno | ⚠️ ANTES dos nós |
| 3º | **kube-proxy** | Proxy de rede Kubernetes | ⚠️ ANTES dos nós |
| 4º | **Metrics Server** | Métricas para HPA | ✅ DEPOIS dos nós |

**Passo a passo para cada add-on:**

1. Selecione o add-on desejado
2. Escolha a versão mais recente compatível com seu cluster
3. Em **IAM role**, deixe em branco para usar o padrão
4. Clique em **Add** ou **Create**
5. Aguarde o status ficar **Active** antes de passar para o próximo

**Verificar instalação via console:**
- Na aba **Add-ons**, todos devem mostrar status **Active**

---

#### 3.3.2. Amazon VPC CNI (CRÍTICO - Instalar PRIMEIRO)

**⚠️ OBRIGATÓRIO - Instalar ANTES dos nós serem provisionados**

O Amazon VPC CNI permite que os pods tenham IPs da VPC e se comuniquem com serviços AWS.

**Instalar via Console AWS:**
1. EKS > Cluster > Add-ons > **Get more add-ons**
2. Selecione **Amazon VPC CNI**
3. Escolha a versão mais recente
4. Clique em **Add**
5. Aguarde o status ficar **Active**

**Sintomas de falta do VPC CNI:**
- Pods não conseguem obter IP da VPC
- Erro de "network not ready" ao criar pods
- Conectividade intermitente entre pods e serviços AWS

---

#### 3.3.3. CoreDNS (CRÍTICO - Instalar SEGUNDO)

**⚠️ OBRIGATÓRIO - Instalar ANTES dos nós serem provisionados**

O CoreDNS permite que os pods resolvam nomes de serviços internos e externos.

**Instalar via Console AWS:**
1. EKS > Cluster > Add-ons > **Get more add-ons**
2. Selecione **CoreDNS**
3. Escolha a versão mais recente
4. Clique em **Add**
5. Aguarde o status ficar **Active**

**Sintomas de falta do CoreDNS:**
- Erro de "no such host" ao resolver nomes de serviços
- Pods não conseguem acessar outros serviços pelo nome

---

#### 3.3.4. kube-proxy (CRÍTICO - Instalar TERCEIRO)

**⚠️ OBRIGATÓRIO - Instalar ANTES dos nós serem provisionados**

O kube-proxy gerencia as regras de rede para serviços Kubernetes.

**Instalar via Console AWS:**
1. EKS > Cluster > Add-ons > **Get more add-ons**
2. Selecione **kube-proxy**
3. Escolha a versão mais recente
4. Clique em **Add**
5. Aguarde o status ficar **Active**

**Sintomas de falta do kube-proxy:**
- Erro de timeout ao conectar ao Redis/ElastiCache
- Pods conseguem resolver DNS mas não conseguem estabelecer conexão TCP

---

### 3.4. EKS Auto Mode (Nós Automáticos)

**⚠️ IMPORTANTE:** Com o EKS Auto Mode habilitado, você NÃO precisa criar Node Groups manualmente. O Karpenter integrado provisiona nós automaticamente.

**Verificar se o EKS Auto Mode está ativo:**
1. No console EKS, vá em **Compute**
2. Você deve ver uma seção **EKS Auto Mode** com Node Pools
3. Os nós são criados automaticamente quando há pods para agendar

**Vantagens do EKS Auto Mode:**
- ✅ Nós provisionados automaticamente sob demanda
- ✅ Usa imagens Bottlerocket (mais estáveis)
- ✅ Escalonamento automático com Karpenter
- ✅ Evita problemas de IMDS do AWS Academy

**⚠️ NÃO crie Node Groups tradicionais no AWS Academy:**
- Node Groups podem falhar com erro `NodeCreationFailure`
- Problemas de IMDS (Instance Metadata Service)
- Credenciais não são propagadas corretamente

Se você acidentalmente criou um Node Group e ele falhou, delete-o:
```bash
aws eks delete-nodegroup --cluster-name togglemaster-cluster --nodegroup-name togglemaster-workers --region us-east-1
```

### 3.5. Conectar kubectl ao Cluster

```bash
# Atualizar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name togglemaster-cluster

# Verificar conexão (deve mostrar os nodes)
kubectl get nodes

# Verificar cluster
kubectl cluster-info
```

### 3.6. Configuração de VPC e Security Groups (CRÍTICO)

**⚠️ IMPORTANTE:** Esta etapa é OBRIGATÓRIA para o funcionamento correto do cluster. Sem ela, o LoadBalancer e o DNS não funcionarão.

#### 3.6.1. Adicionar Tags às Subnets

As subnets precisam de tags específicas para que o AWS Load Balancer Controller funcione corretamente.

```bash
# Obter IDs das subnets do cluster
aws ec2 describe-subnets --filters "Name=vpc-id,Values=$(aws eks describe-cluster --name togglemaster-cluster --query 'cluster.resourcesVpcConfig.vpcId' --output text)" --query 'Subnets[*].SubnetId' --output text

# Para CADA subnet listada, adicionar as tags:
for subnet in <SUBNET_ID_1> <SUBNET_ID_2> <SUBNET_ID_3> <SUBNET_ID_4> <SUBNET_ID_5>; do
  aws ec2 create-tags --resources $subnet --tags \
    Key=kubernetes.io/cluster/togglemaster-cluster,Value=shared \
    Key=kubernetes.io/role/elb,Value=1 \
    Key=kubernetes.io/role/internal-elb,Value=1
done
```

**Exemplo real executado:**
```bash
# Subnets do cluster togglemaster-cluster
for subnet in subnet-0cdd01015a2f551fe subnet-0d16cb4f2d00d5fce subnet-0fa44af5c556dd9c5 subnet-01a2363a89089e31e subnet-0c43fc638038eb98b; do
  aws ec2 create-tags --resources $subnet --tags \
    Key=kubernetes.io/cluster/togglemaster-cluster,Value=shared \
    Key=kubernetes.io/role/elb,Value=1 \
    Key=kubernetes.io/role/internal-elb,Value=1
done
```

#### 3.6.2. Configurar Security Groups

Adicionar regras para permitir tráfego interno da VPC:

```bash
# Obter ID do Security Group do cluster
SG_ID=$(aws eks describe-cluster --name togglemaster-cluster --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId' --output text)

# Obter CIDR da VPC
VPC_CIDR=$(aws ec2 describe-vpcs --vpc-ids $(aws eks describe-cluster --name togglemaster-cluster --query 'cluster.resourcesVpcConfig.vpcId' --output text) --query 'Vpcs[0].CidrBlock' --output text)

# Adicionar regra para permitir tráfego da VPC
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol all \
  --port -1 \
  --cidr $VPC_CIDR
```

**Valores reais do cluster:**
- VPC ID: `vpc-018e2024769475595`
- VPC CIDR: `172.31.0.0/16`
- Cluster SG: `sg-01896e6a89310d603`

### 3.7. Instalar Metrics Server (DEPOIS dos nós ativos)

**⚠️ NOTA:** O Metrics Server deve ser instalado DEPOIS que os nós estiverem ativos. Ele é necessário para o Horizontal Pod Autoscaler (HPA).

> **Nota:** O Metrics Server pode não aparecer na lista de add-ons gerenciados da AWS. Nesse caso, instale via kubectl.

**Instalar via kubectl:**
```bash
# Metrics Server (necessário para HPA funcionar)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verificar se está rodando
kubectl get pods -n kube-system | grep metrics

# Testar métricas
kubectl top nodes
kubectl top pods -n togglemaster
```

### 3.8. ElastiCache Serverless - Requisito de TLS

**⚠️ IMPORTANTE:** O ElastiCache Serverless Redis **REQUER conexão TLS**. O evaluation-service deve ser configurado para usar TLS.

**Configuração no ConfigMap:**
```yaml
# Em k8s/configmap.yaml
REDIS_HOST: "togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com:6379"
REDIS_TLS: "true"
```

**Testar conectividade Redis com TLS:**
```bash
# Testar conexão TLS ao Redis
kubectl run redis-tls-test --rm -i --restart=Never --image=redis:alpine -n togglemaster -- \
  redis-cli -h togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com -p 6379 --tls --insecure PING
# Deve retornar: PONG
```

**Sem TLS, o erro será:**
```
read tcp X.X.X.X:XXXXX->X.X.X.X:6379: i/o timeout
```

### 3.9. Nginx Ingress Controller

**⚠️ IMPORTANTE:** Em ambientes AWS Academy, os nós do nodegroup podem ter problemas de conectividade com a API do Kubernetes. Use EKS Auto nodes quando possível.

**Opção 1: Usar o manifesto do projeto (recomendado)**

O projeto já possui um manifesto completo do NGINX Ingress Controller em `ingress/ingress-nginx.yaml`:

```bash
# Aplicar o manifesto do projeto
kubectl apply -f ingress/ingress-nginx.yaml

# Verificar se está rodando
kubectl get pods -n ingress-nginx
```

**Se o webhook de admissão falhar, crie o secret manualmente:**

```bash
# Gerar certificados autoassinados
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/tls.key \
  -out /tmp/tls.crt \
  -subj "//CN=ingress-nginx-controller-admission.ingress-nginx.svc" \
  -addext "subjectAltName=DNS:ingress-nginx-controller-admission.ingress-nginx.svc,DNS:ingress-nginx-controller-admission.ingress-nginx.svc.cluster.local"

# Criar secret
kubectl create secret generic ingress-nginx-admission \
  --namespace=ingress-nginx \
  --from-file=tls.crt=/tmp/tls.crt \
  --from-file=tls.key=/tmp/tls.key \
  --from-file=ca.crt=/tmp/tls.crt

# Reiniciar o controller
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx
```

**Configurar nodeSelector para EKS Auto nodes (se necessário):**

Se os pods do NGINX Ingress não conseguirem se conectar à API do Kubernetes, configure-os para rodar nos nós EKS Auto:

```bash
kubectl patch deployment ingress-nginx-controller -n ingress-nginx --type=json -p='[{"op":"add","path":"/spec/template/spec/nodeSelector","value":{"eks.amazonaws.com/compute-type":"auto"}}]'
```

**Opção 2: Usar o manifesto oficial**

```bash
# Aplicar diretamente do repositório oficial
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Verificar se está rodando
kubectl get pods -n ingress-nginx
```

**Verificar LoadBalancer:**

```bash
# Verificar se o LoadBalancer foi criado
kubectl get svc -n ingress-nginx ingress-nginx-controller

# O EXTERNAL-IP deve mostrar algo como:
# k8s-ingressn-ingressn-xxxx.elb.us-east-1.amazonaws.com
```

### 3.10. Criar Manifestos Kubernetes

Os manifestos Kubernetes já estão criados na pasta `k8s/` do projeto com os valores reais da infraestrutura AWS.

**Estrutura dos arquivos:**

```
k8s/
├── namespace.yaml        # Namespace togglemaster
├── secrets.yaml          # Secrets com credenciais (Postgres, MasterKey)
├── configmap.yaml        # Configurações e endpoints
├── deployments.yaml      # Deployments e Services
├── ingress.yaml          # Ingress para roteamento
└── hpa.yaml             # Horizontal Pod Autoscaler

ingress/
└── ingress-nginx.yaml    # NGINX Ingress Controller completo

docs/scripts/
├── windows/
│   └── update-aws-credentials.bat  # Atualizar credenciais AWS
└── linux/
    └── update-aws-credentials.sh   # Atualizar credenciais AWS
```

**Valores já configurados:**

| Recurso | Valor |
|---------|-------|
| ECR ID | `886833754732` |
| AUTH_DB_HOST | `togglemaster-auth.c6h7fxfgdm94.us-east-1.rds.amazonaws.com` |
| FLAG_DB_HOST | `togglemaster-flags.c6h7fxfgdm94.us-east-1.rds.amazonaws.com` |
| TARGETING_DB_HOST | `togglemaster-targeting.c6h7fxfgdm94.us-east-1.rds.amazonaws.com` |
| REDIS_HOST | `togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com:6379` |
| SQS_URL | `https://sqs.us-east-1.amazonaws.com/886833754732/togglemaster-analytics-queue` |

**⚠️ IMPORTANTE:** Se precisar recriar os manifestos, use os modelos abaixo. Substitua `<SEU_ID_ECR>` pelo seu ID da AWS.

**⚠️ CRÍTICO - nodeSelector para EKS Auto:** Em ambientes AWS Academy, os nós do nodegroup podem ter problemas de DNS. Adicione `nodeSelector` para usar apenas nós EKS Auto:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
```

#### 1-namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: togglemaster
  labels:
    name: togglemaster
```

#### 2-secrets.yaml

**⚠️ IMPORTANTE:** Os secrets contêm credenciais sensíveis. Gere seus próprios valores em base64:

```bash
# Gerar valores em base64
echo -n "seu_usuario" | base64
echo -n "sua_senha" | base64
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: togglemaster
type: Opaque
data:
  # Valores em base64
  # Para gerar: echo -n "valor" | base64
  POSTGRES_USER: cG9zdGdyZXM= # "postgres" - substituir pelo valor real
  POSTGRES_PASSWORD: dG9nZ2xlbWFzdGVyITEyMzQ= # "togglemaster!1234" - substituir pelo valor real
  MASTER_KEY: YWRtaW4tc2VjcmV0by0xMjM= # "admin-secreto-123" - substituir pelo valor real
  # NOTA: Credenciais AWS são armazenadas em secret separado (aws-credentials).
  # Veja a seção "Credenciais AWS para Serviços" para configurar.
```

#### 3-configmap.yaml

**Valores de exemplo (substitua pelos seus endpoints reais):**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: togglemaster
data:
  # Database hosts (RDS)
  AUTH_DB_HOST: "togglemaster-auth.c6h7fxfgdm94.us-east-1.rds.amazonaws.com"
  FLAG_DB_HOST: "togglemaster-flags.c6h7fxfgdm94.us-east-1.rds.amazonaws.com"
  TARGETING_DB_HOST: "togglemaster-targeting.c6h7fxfgdm94.us-east-1.rds.amazonaws.com"
  REDIS_HOST: "togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com:6379"
  # URLs de servicos internos (comunicacao entre microservicos)
  AUTH_SERVICE_URL: "http://auth-service:8001"
  FLAG_SERVICE_URL: "http://flag-service:8002"
  TARGETING_SERVICE_URL: "http://targeting-service:8003"
  EVALUATION_SERVICE_URL: "http://evaluation-service:8004"
  ANALYTICS_SERVICE_URL: "http://analytics-service:8005"
  # Configuracoes AWS
  AWS_REGION: "us-east-1"
  AWS_SQS_URL: "https://sqs.us-east-1.amazonaws.com/886833754732/togglemaster-analytics-queue"
  AWS_DYNAMODB_TABLE: "ToggleMasterAnalytics"
  # Endpoints AWS (vazio para producao, preencher para LocalStack)
  AWS_SQS_ENDPOINT_URL: ""
  AWS_DYNAMODB_ENDPOINT_URL: ""
```

#### 4-deployments.yaml

**⚠️ IMPORTANTE:** Substitua `886833754732` pelo seu ID da AWS.

```yaml
# ==========================================
# AUTH SERVICE
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: togglemaster
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
      containers:
        - name: auth-service
          image: 886833754732.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
          ports:
            - containerPort: 8001
          env:
            - name: PORT
              value: "8001"
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_PASSWORD
            - name: AUTH_DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AUTH_DB_HOST
            - name: DATABASE_URL
              value: "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(AUTH_DB_HOST):5432/auth_db"
            - name: MASTER_KEY
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: MASTER_KEY
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8001
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: togglemaster
spec:
  selector:
    app: auth-service
  ports:
    - port: 8001
      targetPort: 8001
  type: ClusterIP

---
# ==========================================
# FLAG SERVICE
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flag-service
  namespace: togglemaster
spec:
  replicas: 1
  selector:
    matchLabels:
      app: flag-service
  template:
    metadata:
      labels:
        app: flag-service
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
      containers:
        - name: flag-service
          image: 886833754732.dkr.ecr.us-east-1.amazonaws.com/flag-service:latest
          ports:
            - containerPort: 8002
          env:
            - name: PORT
              value: "8002"
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_PASSWORD
            - name: FLAG_DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: FLAG_DB_HOST
            - name: DATABASE_URL
              value: "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(FLAG_DB_HOST):5432/flags_db"
            - name: AUTH_SERVICE_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AUTH_SERVICE_URL
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8002
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8002
            initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: flag-service
  namespace: togglemaster
spec:
  selector:
    app: flag-service
  ports:
    - port: 8002
      targetPort: 8002
  type: ClusterIP

---
# ==========================================
# TARGETING SERVICE
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: targeting-service
  namespace: togglemaster
spec:
  replicas: 1
  selector:
    matchLabels:
      app: targeting-service
  template:
    metadata:
      labels:
        app: targeting-service
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
      containers:
        - name: targeting-service
          image: 886833754732.dkr.ecr.us-east-1.amazonaws.com/targeting-service:latest
          ports:
            - containerPort: 8003
          env:
            - name: PORT
              value: "8003"
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_PASSWORD
            - name: TARGETING_DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: TARGETING_DB_HOST
            - name: DATABASE_URL
              value: "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(TARGETING_DB_HOST):5432/targeting_db"
            - name: AUTH_SERVICE_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AUTH_SERVICE_URL
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8003
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8003
            initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: targeting-service
  namespace: togglemaster
spec:
  selector:
    app: targeting-service
  ports:
    - port: 8003
      targetPort: 8003
  type: ClusterIP

---
# ==========================================
# EVALUATION SERVICE (HPA habilitado)
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: evaluation-service
  namespace: togglemaster
spec:
  replicas: 1
  selector:
    matchLabels:
      app: evaluation-service
  template:
    metadata:
      labels:
        app: evaluation-service
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
      containers:
        - name: evaluation-service
          image: 886833754732.dkr.ecr.us-east-1.amazonaws.com/evaluation-service:latest
          ports:
            - containerPort: 8004
          env:
            - name: PORT
              value: "8004"
            - name: REDIS_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: REDIS_HOST
            - name: REDIS_URL
              value: "redis://$(REDIS_HOST)"
            - name: FLAG_SERVICE_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: FLAG_SERVICE_URL
            - name: TARGETING_SERVICE_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: TARGETING_SERVICE_URL
            - name: AWS_SQS_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_SQS_URL
            - name: AWS_REGION
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_REGION
            - name: AUTH_SERVICE_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AUTH_SERVICE_URL
            - name: MASTER_KEY
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: MASTER_KEY
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8004
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8004
            initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: evaluation-service
  namespace: togglemaster
spec:
  selector:
    app: evaluation-service
  ports:
    - port: 8004
      targetPort: 8004
  type: ClusterIP

---
# ==========================================
# ANALYTICS SERVICE
# ==========================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-service
  namespace: togglemaster
spec:
  replicas: 1
  selector:
    matchLabels:
      app: analytics-service
  template:
    metadata:
      labels:
        app: analytics-service
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
      containers:
        - name: analytics-service
          image: 886833754732.dkr.ecr.us-east-1.amazonaws.com/analytics-service:latest
          ports:
            - containerPort: 8005
          env:
            - name: PORT
              value: "8005"
            - name: AWS_REGION
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_REGION
            - name: AWS_SQS_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_SQS_URL
            - name: AWS_DYNAMODB_TABLE
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_DYNAMODB_TABLE
            - name: AWS_SQS_ENDPOINT_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_SQS_ENDPOINT_URL
            - name: AWS_DYNAMODB_ENDPOINT_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AWS_DYNAMODB_ENDPOINT_URL
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: AWS_ACCESS_KEY_ID
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: AWS_SECRET_ACCESS_KEY
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8005
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8005
            initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: analytics-service
  namespace: togglemaster
spec:
  selector:
    app: analytics-service
  ports:
    - port: 8005
      targetPort: 8005
  type: ClusterIP
```

#### 5-ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: togglemaster-ingress
  namespace: togglemaster
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          # Auth Service
          - path: /auth(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 8001
          # Flag Service
          - path: /flags(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: flag-service
                port:
                  number: 8002
          # Targeting Service
          - path: /targeting(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: targeting-service
                port:
                  number: 8003
          # Evaluation Service
          - path: /evaluate(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: evaluation-service
                port:
                  number: 8004
          # Analytics Service
          - path: /analytics(/|$)(.*)
            pathType: Prefix
            backend:
              service:
                name: analytics-service
                port:
                  number: 8005
```

#### 6-hpa.yaml

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: evaluation-hpa
  namespace: togglemaster
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: evaluation-service
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
        - type: Pods
          value: 2
          periodSeconds: 30
      selectPolicy: Max
```

### 3.11. Aplicar os Manifestos

**⚠️ IMPORTANTE:** Aplique nesta ordem!

```bash
# 0. PRÉ-REQUISITO: Configurar VPC (Seção 3.5)
# Adicionar tags às subnets e regras de Security Group

# 1. Criar namespace
kubectl apply -f k8s/namespace.yaml

# 2. Criar secrets
kubectl apply -f k8s/secrets.yaml

# 3. Criar configmap
kubectl apply -f k8s/configmap.yaml

# 4. Criar deployments e services
kubectl apply -f k8s/deployments.yaml

# 5. Criar ingress (pode falhar se webhook não estiver pronto)
kubectl apply -f k8s/ingress.yaml

# Se falhar com erro de webhook, delete o webhook e tente novamente:
# kubectl delete validatingwebhookconfiguration ingress-nginx-admission
# kubectl apply -f k8s/ingress.yaml

# 6. Criar HPA
kubectl apply -f k8s/hpa.yaml
```

### 3.13. Verificar Status

```bash
# Ver pods (todos devem estar Running)
kubectl get pods -n togglemaster

# Ver services
kubectl get services -n togglemaster

# Ver ingress (anote o ADDRESS)
kubectl get ingress -n togglemaster

# Ver HPA
kubectl get hpa -n togglemaster

# Ver todos os recursos
kubectl get all -n togglemaster
```

### 3.14. Obter URL de Acesso

```bash
# Obter endereço do ingress
kubectl get ingress togglemaster-ingress -n togglemaster

# A URL será algo como:
# http://<ADDRESS_DO_INGRESS>
```

---

## ETAPA 4: Testes e Validação

### 4.1. Health Check

```bash
# Obter URL do ingress
INGRESS_URL=$(kubectl get ingress togglemaster-ingress -n togglemaster -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Testar cada serviço
curl http://$INGRESS_URL/auth/health
curl http://$INGRESS_URL/flags/health
curl http://$INGRESS_URL/targeting/health
curl http://$INGRESS_URL/evaluate/health
curl http://$INGRESS_URL/analytics/health
```

### 4.2. Teste de Integração

```bash
# 1. Criar usuário
curl -X POST http://$INGRESS_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}'

# 2. Fazer login
TOKEN=$(curl -X POST http://$INGRESS_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 3. Criar feature flag
curl -X POST http://$INGRESS_URL/flags \
  -H "Content-Type: application/json" \
  -d '{"name":"nova_feature","description":"Teste de nova feature","enabled":true}'

# 4. Listar flags
curl http://$INGRESS_URL/flags

# 5. Avaliar flag
curl -X POST http://$INGRESS_URL/evaluate \
  -H "Content-Type: application/json" \
  -d '{"flagName":"nova_feature","userId":"user123"}'

# 6. Coletar analytics
curl -X POST http://$INGRESS_URL/analytics \
  -H "Content-Type: application/json" \
  -d '{"flagName":"nova_feature","userId":"user123","enabled":true}'

# 7. Ver estatísticas
curl http://$INGRESS_URL/analytics/stats
```

### 4.3. Teste de Escalabilidade (HPA)

```bash
# Instalar hey (load generator)
# Windows: choco install hey
# Mac: brew install hey
# Linux: go install github.com/rakyll/hey@latest

# Terminal 1: Monitorar HPA
kubectl get hpa -n togglemaster -w

# Terminal 2: Monitorar pods
kubectl get pods -n togglemaster -w

# Terminal 3: Gerar carga
INGRESS_URL=$(kubectl get ingress togglemaster-ingress -n togglemaster -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
hey -z 5m -c 50 http://$INGRESS_URL/evaluate

# Observe:
# - O HPA detectar o aumento de CPU
# - O número de replicas aumentar
# - Após o teste, as replicas diminuem gradualmente
```

---

## ETAPA 5: Vídeo de Apresentação

### Roteiro Sugerido (8-12 minutos)

#### 1. Introdução (1 minuto)

- Apresentação pessoal
- Nome do projeto: **ToggleMaster**
- Propósito: Sistema de Feature Flags

#### 2. Arquitetura (1 minuto)

- 5 microsserviços
- Stack tecnológica (Go, Python, PostgreSQL, Redis, DynamoDB, SQS)
- Kubernetes + AWS

#### 3. Ambiente Local com Docker Compose (3 minutos)

**⚠️ IMPORTANTE:** Demonstre primeiro o ambiente local funcionando com Docker Compose.

**Terminal - Subir ambiente local:**
```bash
# Navegue para a raiz do projeto
cd tech-challenger/fase-2

# Suba todos os serviços com Docker Compose
docker-compose up -d

# Verifique se todos os containers estão rodando
docker-compose ps

# Veja os logs
docker-compose logs -f
```

**Console Docker Desktop:**
- Mostre os containers rodando
- Verifique se todos os serviços estão "healthy"

**Teste rápido:**
```bash
# Verificar saúde dos serviços
curl http://localhost:8001/health  # auth-service
curl http://localhost:8002/health  # flag-service
curl http://localhost:8003/health  # targeting-service
curl http://localhost:8004/health  # evaluation-service
curl http://localhost:8005/health  # analytics-service
```

#### 4. Demonstração com Postman (3 minutos)

**⚠️ IMPORTANTE:** Use o Postman para demonstrar o fluxo completo de feature flags.

**Coleção Postman - Crie uma coleção com as seguintes requisições:**

1. **Health Checks** (pasta)
   - GET `http://localhost:8001/health` - Auth Service
   - GET `http://localhost:8002/health` - Flag Service
   - GET `http://localhost:8003/health` - Targeting Service
   - GET `http://localhost:8004/health` - Evaluation Service
   - GET `http://localhost:8005/health` - Analytics Service

2. **API Key** (pasta)
   - POST `http://localhost:8001/admin/keys` - Gerar API Key
     - Header: `Authorization: Bearer <MASTER_KEY>`
     - Body: `{"name": "demo-key"}`

3. **Feature Flags** (pasta)
   - POST `http://localhost:8002/flags` - Criar Flag
     - Header: `Authorization: Bearer <API_KEY>`
     - Body: `{"name": "dark-mode", "is_enabled": true}`
   - GET `http://localhost:8002/flags` - Listar Flags
   - GET `http://localhost:8002/flags/dark-mode` - Obter Flag

4. **Targeting Rules** (pasta)
   - POST `http://localhost:8003/rules` - Criar Regra
     - Header: `Authorization: Bearer <API_KEY>`
     - Body:
       ```json
       {
         "flag_name": "dark-mode",
         "is_enabled": true,
         "rules": {"type": "PERCENTAGE", "value": 50}
       }
       ```

5. **Evaluation** (pasta)
   - GET `http://localhost:8004/evaluate?user_id=user123&flag_name=dark-mode` - Avaliar Flag
     - Mostre o resultado true/false baseado na regra de 50%

**Demonstração:**
1. Execute o health check de todos os serviços
2. Gere uma API Key
3. Crie uma feature flag "dark-mode"
4. Crie uma regra de 50% para a flag
5. Avalie a flag para diferentes usuários
6. Mostre que o resultado varia (alguns usuários recebem true, outros false)

#### 5. Ambiente Cloud (3 minutos)

**Console AWS - Mostre:**

- Cluster EKS ativo
- Nodes rodando
- RDS (3 instâncias PostgreSQL)
- ElastiCache Redis
- DynamoDB com tabela criada
- SQS com fila criada

**Terminal - Comandos:**

```bash
kubectl get nodes
kubectl get pods -n togglemaster
kubectl get hpa -n togglemaster
kubectl get ingress -n togglemaster
```

#### 6. Teste de Escalabilidade (2 minutos)

```bash
# Terminal 1: Monitoramento
kubectl get pods -n togglemaster -w

# Terminal 2: Teste de carga
hey -z 3m -c 30 http://<INGRESS_URL>/evaluate
```

- Explique o HPA
- Mostre replicas aumentando

#### 7. Conclusão (1 minuto)

- Tecnologias utilizadas
- Desafios superados (TLS para Redis, credenciais AWS via Secret, EKS Auto Mode)
- Próximas melhorias

---

## Checklist Final

### AWS ECR

- [ ] 5 repositórios criados
- [ ] Autenticação ECR funcionando
- [ ] Todas as imagens pushadas

### Infraestrutura AWS

- [ ] 3 bancos RDS PostgreSQL criados
- [ ] ElastiCache Redis criado
- [ ] DynamoDB tabela criada
- [ ] SQS fila criada
- [ ] Endpoints anotados

### Kubernetes EKS

- [ ] Cluster criado e ativo (com EKS Auto Mode)
- [ ] Nós provisionados automaticamente (EKS Auto Mode)
- [ ] kubectl conectado
- [ ] **kube-proxy instalado** (CRÍTICO para ElastiCache)
- [ ] **Amazon VPC CNI instalado** (CRÍTICO para networking)
- [ ] **CoreDNS instalado** (CRÍTICO para DNS)
- [ ] Metrics Server instalado
- [ ] Nginx Ingress instalado
- [ ] Namespace criado
- [ ] Secrets criados (incluindo aws-credentials)
- [ ] ConfigMap criado (com REDIS_TLS=true)
- [ ] Deployments aplicados
- [ ] Services criados
- [ ] Ingress criado
- [ ] HPA criado
- [ ] **Credenciais AWS configuradas** (via Secret)

### Validação

- [ ] Todos os pods rodando
- [ ] Health checks funcionando
- [ ] Testes de integração passando
- [ ] HPA funcionando (testado com carga)

### Apresentação

- [ ] Vídeo gravado (5-10 minutos)
- [ ] Link enviado

---

## Comandos de Referência

```bash
# ============ KUBERNETES ============
kubectl get pods -n togglemaster
kubectl get services -n togglemaster
kubectl get ingress -n togglemaster
kubectl get hpa -n togglemaster
kubectl logs -f <pod> -n togglemaster
kubectl describe pod <pod> -n togglemaster

# ============ AWS CLI ============
aws eks describe-cluster --name togglemaster-cluster --region us-east-1
aws rds describe-db-instances --region us-east-1
aws elasticache describe-cache-clusters --region us-east-1
aws dynamodb list-tables --region us-east-1
aws sqs list-queues --region us-east-1
```

---

## Troubleshooting

### Pods não iniciam (CrashLoopBackOff)

```bash
kubectl describe pod <pod-name> -n togglemaster
kubectl logs <pod-name> -n togglemaster
```

### HPA não funciona

```bash
# Verificar Metrics Server
kubectl get pods -n kube-system | grep metrics

# Ver detalhes do HPA
kubectl describe hpa evaluation-hpa -n togglemaster
```

### Erro de conexão com RDS

- Verificar Security Group do RDS
- Deve permitir tráfego da VPC do EKS na porta 5432

---

## ⚠️ PROBLEMAS CONHECIDOS E SOLUÇÕES (AWS Academy)

### Problema 1: LoadBalancer não cria (subnet tags)

**Erro:**
```
Warning FailedBuildModel: unable to resolve at least one subnet (0 match VPC and tags: [kubernetes.io/role/internal-elb])
```

**Solução:**
```bash
# Adicionar tags às subnets
for subnet in <SUBNET_IDS>; do
  aws ec2 create-tags --resources $subnet --tags \
    Key=kubernetes.io/cluster/togglemaster-cluster,Value=shared \
    Key=kubernetes.io/role/elb,Value=1 \
    Key=kubernetes.io/role/internal-elb,Value=1
done
```

### Problema 2: CoreDNS não conecta à API Kubernetes

**Erro nos logs:**
```
[INFO] plugin/kubernetes: waiting for Kubernetes API before starting server
[ERROR] plugin/kubernetes: Failed to watch
```

**Causa:** Security Group não permite tráfego da VPC.

**Solução:**
```bash
# Obter SG do cluster e CIDR da VPC
SG_ID=$(aws eks describe-cluster --name togglemaster-cluster --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId' --output text)
VPC_CIDR=$(aws ec2 describe-vpcs --vpc-ids $(aws eks describe-cluster --name togglemaster-cluster --query 'cluster.resourcesVpcConfig.vpcId' --output text) --query 'Vpcs[0].CidrBlock' --output text)

# Adicionar regra
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol all --port -1 --cidr $VPC_CIDR

# Reiniciar CoreDNS
kubectl rollout restart deployment coredns -n kube-system
```

### Problema 3: Pods em nós do NodeGroup não resolvem DNS

**Sintoma:** Pods em nós `ip-172-31-x-x.ec2.internal` não conseguem resolver DNS, mas pods em nós `i-xxxxxx` (EKS Auto) funcionam.

**Solução:** Adicionar `nodeSelector` aos deployments para usar apenas nós EKS Auto:

```yaml
spec:
  template:
    spec:
      nodeSelector:
        eks.amazonaws.com/compute-type: auto
```

**Ou via kubectl patch:**
```bash
kubectl patch deployment <deployment-name> -n togglemaster --type=json -p='[{"op":"add","path":"/spec/template/spec/nodeSelector","value":{"eks.amazonaws.com/compute-type":"auto"}}]'
```

### Problema 4: NGINX Ingress Controller webhook falha

**Erro:**
```
MountVolume.SetUp failed for volume "webhook-cert" : secret "ingress-nginx-admission" not found
```

**Solução:**
```bash
# Deletar webhook temporariamente
kubectl delete validatingwebhookconfiguration ingress-nginx-admission

# Ou criar secret manualmente com certificados
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/tls.key -out /tmp/tls.crt \
  -subj "//CN=ingress-nginx-controller-admission.ingress-nginx.svc"

kubectl create secret generic ingress-nginx-admission \
  --namespace=ingress-nginx \
  --from-file=tls.crt=/tmp/tls.crt \
  --from-file=tls.key=/tmp/tls.key \
  --from-file=ca.crt=/tmp/tls.crt
```

### Problema 5: Erro "relation does not exist" no banco de dados

**Erro:**
```
ERROR: relation "api_keys" does not exist (SQLSTATE 42P01)
```

**Causa:** Migrações de banco de dados não foram executadas.

**Solução:** Executar migrações SQL no RDS antes de iniciar os serviços:

```sql
-- Conectar ao RDS e executar:
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Problema 6: Analytics Service - Credenciais AWS não funcionam (IMDS)

**Erro:**
```
ERROR - Erro ao garantir existência da tabela: Unable to locate credentials
ou
ERROR - The security token included in the request is invalid
```

**Causa:** No AWS Academy, os nós do EKS Auto Mode têm `HttpPutResponseHopLimit: 1`, impedindo que containers acessem o IMDS para obter credenciais AWS automaticamente.

**Solução:** Usar credenciais via Secret do Kubernetes:

```bash
# Executar o script de atualização de credenciais
.\docs\scripts\windows\update-aws-credentials.bat  # Windows
./docs/scripts/linux/update-aws-credentials.sh     # Linux/Mac
```

**Ou manualmente:**
```bash
# Obter credenciais do arquivo ~/.aws/credentials
AWS_ACCESS_KEY_ID=$(grep aws_access_key_id ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SECRET_ACCESS_KEY=$(grep aws_secret_access_key ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SESSION_TOKEN=$(grep aws_session_token ~/.aws/credentials | cut -d'=' -f2- | sed 's/^ *//')

# Criar secret no Kubernetes
cat > /tmp/aws-credentials.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
  namespace: togglemaster
type: Opaque
stringData:
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
  AWS_SESSION_TOKEN: ${AWS_SESSION_TOKEN}
EOF

kubectl apply -f /tmp/aws-credentials.yaml

# Reiniciar serviços
kubectl rollout restart deployment/analytics-service -n togglemaster
kubectl rollout restart deployment/evaluation-service -n togglemaster
```

**⚠️ NOTA:** As credenciais do AWS Academy expiram quando a sessão do lab termina. Execute o script novamente se necessário.

### Problema 7: Evaluation Service - Timeout ao conectar ao Redis (ElastiCache)

**Erro:**
```
Não foi possível conectar ao Redis: read tcp 172.31.5.242:47910->172.31.13.182:6379: i/o timeout
```

**Causa:** O Security Group do ElastiCache não permite conexões do EKS na porta 6379.

**Solução via AWS Console:**

1. Acesse o **AWS Console** > **ElastiCache** > **Serverless caches**
2. Clique no cache `togglemaster-cache`
3. Vá em **Security groups**
4. Anote o Security Group ID (ex: `sg-xxxxxxxx`)
5. Vá para **EC2** > **Security Groups**
6. Encontre o Security Group do ElastiCache
7. Clique em **Edit inbound rules**
8. Adicione uma regra:
   - **Type:** Custom TCP
   - **Port:** 6379
   - **Source:** `172.31.0.0/16` (CIDR da VPC) ou o Security Group do EKS

**Solução via CLI:**
```bash
# Obter Security Group do ElastiCache (ajuste o nome se necessário)
ELASTICACHE_SG=$(aws elasticache describe-cache-clusters --query "CacheClusters[0].SecurityGroups[0].SecurityGroupId" --output text)

# Adicionar regra para permitir tráfego da VPC
aws ec2 authorize-security-group-ingress \
  --group-id $ELASTICACHE_SG \
  --protocol tcp \
  --port 6379 \
  --cidr 172.31.0.0/16
```

### Problema 8: Node Group com NodeCreationFailure (AWS Academy)

**Erro:**
```
NodeCreationFailure: Instances failed to join the kubernetes cluster
```

**Causa:** No AWS Academy, os Node Groups tradicionais podem falhar devido a:
- Problemas de IMDS (Instance Metadata Service)
- Credenciais não propagadas corretamente
- Falta de política AmazonEKS_CNI_Policy na LabRole

**Solução:** Usar EKS Auto Mode em vez de Node Groups tradicionais:

1. **Se você já criou um Node Group com falha, delete-o:**
   ```bash
   aws eks delete-nodegroup --cluster-name togglemaster-cluster --nodegroup-name togglemaster-workers --region us-east-1
   ```

2. **O EKS Auto Mode já provisiona nós automaticamente** - não precisa de Node Group

3. **Verificar nós ativos:**
   ```bash
   kubectl get nodes
   ```

**⚠️ NOTA:** O EKS Auto Mode usa nós Bottlerocket que funcionam corretamente no AWS Academy.

### Problema 9: LoadBalancer Internal vs Internet-facing

**Sintoma:** Postman retorna timeout, mas serviços funcionam internamente.

**Causa:** O LoadBalancer do NGINX Ingress foi criado como "internal" (IP privado) em vez de "internet-facing".

**Solução:**
```bash
# Adicionar annotation para LoadBalancer internet-facing
kubectl annotate svc ingress-nginx-controller -n ingress-nginx \
  "service.beta.kubernetes.io/aws-load-balancer-scheme=internet-facing" --overwrite

# Recriar o serviço para aplicar a mudança
kubectl delete svc ingress-nginx-controller -n ingress-nginx
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: tcp
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-scheme: internet-facing
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  externalTrafficPolicy: Local
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: http
  - name: https
    port: 443
    protocol: TCP
    targetPort: https
  selector:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
  type: LoadBalancer
EOF

# Aguardar novo hostname
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

---

## Limpeza (Após Apresentação)

```bash
# Kubernetes
kubectl delete namespace togglemaster

# AWS (via console)
# Deletar: EKS cluster, RDS, ElastiCache, DynamoDB table, SQS queue
```

### Problema 10: ElastiCache Serverless - Requisito de TLS

**Erro:**
```
Não foi possível conectar ao Redis: context deadline exceeded
```

**Causa:** O ElastiCache Serverless Redis **REQUER conexão TLS**. Sem TLS, a conexão TCP é estabelecida mas o protocolo Redis falha.

**Testar se é problema de TLS:**
```bash
# Testar SEM TLS (vai falhar/hang)
kubectl run redis-test --rm -i --restart=Never --image=redis:alpine -n togglemaster -- \
  redis-cli -h togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com -p 6379 PING

# Testar COM TLS (deve retornar PONG)
kubectl run redis-tls-test --rm -i --restart=Never --image=redis:alpine -n togglemaster -- \
  redis-cli -h togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com -p 6379 --tls --insecure PING
```

**Solução:** Adicionar configuração de TLS no ConfigMap e no código:

1. **Atualizar ConfigMap** (`k8s/configmap.yaml`):
```yaml
REDIS_HOST: "togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com:6379"
REDIS_TLS: "true"
```

2. **Aplicar ConfigMap:**
```bash
kubectl apply -f k8s/configmap.yaml
```

3. **Reconstruir e fazer push da imagem do evaluation-service** com suporte a TLS.

4. **Reiniciar o deployment:**
```bash
kubectl rollout restart deployment/evaluation-service -n togglemaster
```

---

## 📋 Valores Reais do Deploy (Referência)

### IDs e Endpoints do Cluster Atual

| Recurso | Valor |
|---------|-------|
| **AWS Account ID** | `886833754732` |
| **VPC ID** | `vpc-018e2024769475595` |
| **VPC CIDR** | `172.31.0.0/16` |
| **Cluster Security Group** | `sg-01896e6a89310d603` |
| **Default Security Group** | `sg-0c97beab8695d3849` |

### Subnets

| Subnet ID | AZ |
|-----------|-----|
| `subnet-0cdd01015a2f551fe` | us-east-1a |
| `subnet-0d16cb4f2d00d5fce` | us-east-1a |
| `subnet-0fa44af5c556dd9c5` | us-east-1a |
| `subnet-01a2363a89089e31e` | us-east-1c |
| `subnet-0c43fc638038eb98b` | us-east-1c |

### Endpoints RDS

| Banco | Endpoint |
|-------|----------|
| auth-db | `togglemaster-auth.c6h7fxfgdm94.us-east-1.rds.amazonaws.com` |
| flags-db | `togglemaster-flags.c6h7fxfgdm94.us-east-1.rds.amazonaws.com` |
| targeting-db | `togglemaster-targeting.c6h7fxfgdm94.us-east-1.rds.amazonaws.com` |

### Outros Endpoints

| Recurso | Endpoint |
|---------|----------|
| Redis | `togglemaster-cache-nlxlok.serverless.use1.cache.amazonaws.com:6379` |
| SQS | `https://sqs.us-east-1.amazonaws.com/886833754732/togglemaster-analytics-queue` |
| DynamoDB Table | `ToggleMasterAnalytics` |
| LoadBalancer NLB | `k8s-ingressn-ingressn-4b2dffb93b-3e52bb9ba052b281.elb.us-east-1.amazonaws.com` |

### Nós do Cluster

| Node Name | Tipo | Status |
|-----------|------|--------|
| `i-02b0f95b9feba591f` | Bottlerocket (EKS Auto) | ✅ Funciona |
| `i-082762dac031f313a` | Bottlerocket (EKS Auto) | ✅ Funciona |
| `ip-172-31-23-183.ec2.internal` | Amazon Linux 2023 | ⚠️ DNS problemático |
| `ip-172-31-3-6.ec2.internal` | Amazon Linux 2023 | ⚠️ DNS problemático |

**⚠️ Nota:** Em ambientes AWS Academy, os nós gerenciados por EKS Auto (Bottlerocket) funcionam corretamente com DNS. Os nós do nodegroup padrão podem ter problemas de conectividade com a API do Kubernetes.

---

## 🔐 Credenciais AWS para Serviços (IMPORTANTE)

### Por que precisamos de credenciais no Kubernetes?

Em ambientes **AWS Academy**, os nós do EKS Auto Mode têm `HttpPutResponseHopLimit: 1`, o que impede que containers acessem o **Instance Metadata Service (IMDS)** para obter credenciais AWS automaticamente.

**Serviços afetados:**
- `analytics-service` - precisa acessar DynamoDB e SQS
- `evaluation-service` - precisa acessar SQS

### Como atualizar as credenciais

As credenciais do AWS Academy são **temporárias** e expiram quando a sessão do lab termina. Use o script abaixo para atualizar:

**Windows:**
```bash
.\docs\scripts\windows\update-aws-credentials.bat
```

**Linux/Mac:**
```bash
chmod +x ./docs/scripts/linux/update-aws-credentials.sh
./docs/scripts/linux/update-aws-credentials.sh
```

### Atualização manual (se necessário)

```bash
# 1. Obter credenciais do arquivo ~/.aws/credentials
AWS_ACCESS_KEY_ID=$(grep aws_access_key_id ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SECRET_ACCESS_KEY=$(grep aws_secret_access_key ~/.aws/credentials | cut -d'=' -f2 | tr -d ' ')
AWS_SESSION_TOKEN=$(grep aws_session_token ~/.aws/credentials | cut -d'=' -f2- | sed 's/^ *//')

# 2. Criar secret no Kubernetes
cat > /tmp/aws-credentials.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
  namespace: togglemaster
type: Opaque
stringData:
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
  AWS_SESSION_TOKEN: ${AWS_SESSION_TOKEN}
EOF

kubectl apply -f /tmp/aws-credentials.yaml

# 3. Reiniciar serviços afetados
kubectl rollout restart deployment/analytics-service -n togglemaster
kubectl rollout restart deployment/evaluation-service -n togglemaster
```

### Verificar se as credenciais estão funcionando

```bash
# Verificar logs do analytics-service
kubectl logs -n togglemaster deployment/analytics-service --tail=20

# Deve mostrar: "Tabela ToggleMasterAnalytics já existe."
# Se mostrar erro de token inválido, atualize as credenciais
```

---

## 🚀 Script de Deploy Completo (Quick Start)

```bash
# ============================================
# 1. CONFIGURAR VPC E SECURITY GROUPS
# ============================================
# Adicionar tags às subnets
for subnet in subnet-0cdd01015a2f551fe subnet-0d16cb4f2d00d5fce subnet-0fa44af5c556dd9c5 subnet-01a2363a89089e31e subnet-0c43fc638038eb98b; do
  aws ec2 create-tags --resources $subnet --tags \
    Key=kubernetes.io/cluster/togglemaster-cluster,Value=shared \
    Key=kubernetes.io/role/elb,Value=1 \
    Key=kubernetes.io/role/internal-elb,Value=1
done

# Adicionar regra de Security Group
aws ec2 authorize-security-group-ingress \
  --group-id sg-01896e6a89310d603 \
  --protocol all --port -1 \
  --cidr 172.31.0.0/16

# ============================================
# 2. INSTALAR NGINX INGRESS CONTROLLER
# ============================================
kubectl apply -f ingress/ingress-nginx.yaml

# Aguardar e criar secret se necessário
sleep 30
kubectl create secret generic ingress-nginx-admission \
  --namespace=ingress-nginx \
  --from-literal=ca.crt="" --from-literal=tls.crt="" --from-literal=tls.key="" 2>/dev/null || true

# Configurar nodeSelector
kubectl patch deployment ingress-nginx-controller -n ingress-nginx --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/nodeSelector","value":{"eks.amazonaws.com/compute-type":"auto"}}]'

# ============================================
# 3. DEPLOY DA APLICAÇÃO
# ============================================
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# ============================================
# 4. CONFIGURAR CREDENCIAIS AWS (AWS Academy)
# ============================================
# Executar script de atualização de credenciais
.\docs\scripts\windows\update-aws-credentials.bat  # Windows
# ou
./docs/scripts/linux/update-aws-credentials.sh     # Linux/Mac

# ============================================
# 5. VERIFICAR DEPLOY
# ============================================
kubectl get pods -n togglemaster
kubectl get ingress -n togglemaster
kubectl get svc -n ingress-nginx

# Testar health checks
INGRESS_URL=$(kubectl get ingress togglemaster-ingress -n togglemaster -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$INGRESS_URL/auth/health
curl http://$INGRESS_URL/flags/health
curl http://$INGRESS_URL/targeting/health
curl http://$INGRESS_URL/evaluate/health
curl http://$INGRESS_URL/analytics/health
```

---

**Boa sorte! 🚀**
