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

| Etapa | Descrição | Onde |
|-------|-----------|------|
| 1 | Imagens Docker & ECR | AWS ECR |
| 2 | Infraestrutura AWS | RDS, ElastiCache, DynamoDB, SQS |
| 3 | Kubernetes (EKS) | Cluster EKS |
| 4 | Testes e Validação | Validação completa |
| 5 | Vídeo de Apresentação | Demonstração |

---

## ETAPA 1: Imagens Docker & Amazon ECR

### 1.1. Criar Repositórios no ECR

1. Acesse o console AWS
2. Pesquise por **ECR** (Elastic Container Registry)
3. Vá para **Private registry** > **Repositories**
4. Clique em **Create repository**
5. Crie os 5 repositórios:

| Nome do Repositório |
|-------------------|
| auth-service |
| flag-service |
| targeting-service |
| evaluation-service |
| analytics-service |

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

| Campo | Valor |
|-------|-------|
| Engine | PostgreSQL |
| Engine version | 13.x |
| Template | Free tier |
| DB instance identifier | `togglemaster-auth` |
| Master username | `admin` |
| Master password | Defina uma senha forte e **ANOTE** |
| Initial database name | `auth_db` |
| Instance class | `db.t3.micro` |

3. Em **Connectivity**:
   - VPC: Default VPC
   - Public access: **Yes**
   - VPC security group: Criar novo ou usar default
   - Database port: 5432

4. Clique em **Create database**
5. **ANOTE O ENDPOINT** (algo como `togglemaster-auth.xxxx.us-east-1.rds.amazonaws.com`)

#### Banco 2: flags-db

Repita o processo acima com:

| Campo | Valor |
|-------|-------|
| DB instance identifier | `togglemaster-flags` |
| Initial database name | `flags_db` |

#### Banco 3: targeting-db

Repita o processo acima com:

| Campo | Valor |
|-------|-------|
| DB instance identifier | `togglemaster-targeting` |
| Initial database name | `targeting_db` |

⏱️ **Tempo estimado:** 10-15 minutos para cada banco ficar disponível.

### 2.2. ElastiCache Redis

1. Console AWS > **ElastiCache** > **Redis** > **Create**

2. Configure:

| Campo | Valor |
|-------|-------|
| Cluster name | `togglemaster-cache` |
| Cluster endpoint | Desabilitar |
| Engine version | 7.x |
| Node type | `cache.t3.micro` |
| Number of replicas | 0 |
| Multi-AZ | No |
| Subnet group | Default |

3. Em **Security**:
   - Security group: Criar ou usar default
   - Port: 6379

4. Clique em **Create**

5. **ANOTE O ENDPOINT PRIMÁRIO** (algo como `togglemaster-cache.xxxx.use1.cache.amazonaws.com:6379`)

### 2.3. DynamoDB

1. Console AWS > **DynamoDB** > **Create table**

2. Configure:

| Campo | Valor |
|-------|-------|
| Table name | `ToggleMasterAnalytics` |
| Partition key | `requestId` (String) |
| Sort key | Deixar vazio |
| Table capacity class | On-demand |

3. Clique em **Create table**

### 2.4. SQS

1. Console AWS > **SQS** > **Create queue**

2. Configure:

| Campo | Valor |
|-------|-------|
| Type | Standard |
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

| Campo | Valor |
|-------|-------|
| Name | `togglemaster-cluster` |
| Kubernetes version | 1.28 ou superior |
| Cluster service role | Criar nova role ou usar existente |

3. Em **Specify networking**:

| Campo | Valor |
|-------|-------|
| VPC | Default VPC |
| Cluster endpoint access | Public |
| Subnets | Selecione TODAS as subnets |

4. Clique em **Create cluster**

⏱️ **Tempo estimado:** 10-20 minutos

### 3.3. Criar Node Group

1. No cluster criado, vá em **Compute** > **Add node group**

2. Configure:

| Campo | Valor |
|-------|-------|
| Name | `togglemaster-workers` |
| Node IAM role | **LabRole** (AWS Academy) ou criar nova |
| Capacity type | On-Demand |
| Instance types | `t3.small` |
| Node group scaling | Min: 1, Max: 4, Desired: 2 |

3. Clique em **Create**

⏱️ **Tempo estimado:** 5-10 minutos

### 3.4. Conectar kubectl ao Cluster

```bash
# Atualizar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name togglemaster-cluster

# Verificar conexão (deve mostrar os nodes)
kubectl get nodes

# Verificar cluster
kubectl cluster-info
```

### 3.5. Instalar Add-ons Necessários

```bash
# Metrics Server (necessário para HPA funcionar)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verificar se está rodando
kubectl get pods -n kube-system | grep metrics

# Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# Verificar se está rodando
kubectl get pods -n ingress-nginx
```

### 3.6. Criar Manifestos Kubernetes

Crie uma pasta `k8s/` na raiz do projeto e salve os arquivos abaixo.

**⚠️ IMPORTANTE:** Substitua `<SEU_ID_ECR>` pelo seu ID da AWS em todos os manifestos.

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
  POSTGRES_USER: YWRtaW4=           # "admin"
  POSTGRES_PASSWORD: UGFzc3dvcmQxMjM=  # "Password123" (substituir!)
```

#### 3-configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: togglemaster
data:
  # Substitua pelos endpoints reais que você anotou
  AUTH_DB_HOST: "togglemaster-auth.xxxx.us-east-1.rds.amazonaws.com"
  FLAG_DB_HOST: "togglemaster-flags.xxxx.us-east-1.rds.amazonaws.com"
  TARGETING_DB_HOST: "togglemaster-targeting.xxxx.us-east-1.rds.amazonaws.com"
  REDIS_HOST: "togglemaster-cache.xxxx.use1.cache.amazonaws.com:6379"
  SQS_URL: "https://sqs.us-east-1.amazonaws.com/XXXXXX/togglemaster-analytics-queue"
  DYNAMODB_TABLE: "ToggleMasterAnalytics"
  AWS_REGION: "us-east-1"
```

#### 4-deployments.yaml

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
      containers:
      - name: auth-service
        image: <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: AUTH_DB_HOST
        - name: DB_PORT
          value: "5432"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_PASSWORD
        - name: DB_NAME
          value: "auth_db"
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
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
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
  - port: 8080
    targetPort: 8080
  type: ClusterIP

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
      containers:
      - name: flag-service
        image: <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/flag-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: FLAG_DB_HOST
        - name: DB_PORT
          value: "5432"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_PASSWORD
        - name: DB_NAME
          value: "flags_db"
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
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
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
  - port: 8080
    targetPort: 8080
  type: ClusterIP

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
      containers:
      - name: targeting-service
        image: <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/targeting-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: TARGETING_DB_HOST
        - name: DB_PORT
          value: "5432"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: POSTGRES_PASSWORD
        - name: DB_NAME
          value: "targeting_db"
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
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
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
  - port: 8080
    targetPort: 8080
  type: ClusterIP

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
      containers:
      - name: evaluation-service
        image: <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/evaluation-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: REDIS_HOST
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
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
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
  - port: 8080
    targetPort: 8080
  type: ClusterIP

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
      containers:
      - name: analytics-service
        image: <SEU_ID_ECR>.dkr.ecr.us-east-1.amazonaws.com/analytics-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DYNAMODB_ENDPOINT
          value: "https://dynamodb.us-east-1.amazonaws.com"
        - name: SQS_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: SQS_URL
        - name: AWS_DEFAULT_REGION
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: AWS_REGION
        - name: DYNAMODB_TABLE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DYNAMODB_TABLE
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
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
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
  - port: 8080
    targetPort: 8080
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
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
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
              number: 8080
      # Flag Service
      - path: /flags(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: flag-service
            port:
              number: 8080
      # Targeting Service
      - path: /targeting(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: targeting-service
            port:
              number: 8080
      # Evaluation Service
      - path: /evaluate(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: evaluation-service
            port:
              number: 8080
      # Analytics Service
      - path: /analytics(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: analytics-service
            port:
              number: 8080
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

### 3.7. Aplicar os Manifestos

**⚠️ IMPORTANTE:** Aplique nesta ordem!

```bash
# 1. Criar namespace
kubectl apply -f k8s/1-namespace.yaml

# 2. Criar secrets
kubectl apply -f k8s/2-secrets.yaml

# 3. Criar configmap
kubectl apply -f k8s/3-configmap.yaml

# 4. Criar deployments e services
kubectl apply -f k8s/4-deployments.yaml

# 5. Criar ingress
kubectl apply -f k8s/5-ingress.yaml

# 6. Criar HPA
kubectl apply -f k8s/6-hpa.yaml
```

### 3.8. Verificar Status

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

### 3.9. Obter URL de Acesso

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

### Roteiro Sugerido (5-10 minutos)

#### 1. Introdução (1 minuto)

- Apresentação pessoal
- Nome do projeto: **ToggleMaster**
- Propósito: Sistema de Feature Flags

#### 2. Arquitetura (1 minuto)

- 5 microsserviços
- Stack tecnológica (Go, Python, PostgreSQL, Redis, DynamoDB, SQS)
- Kubernetes + AWS

#### 3. Ambiente Cloud (4 minutos)

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

#### 4. Teste de Escalabilidade (2 minutos)

```bash
# Terminal 1: Monitoramento
kubectl get pods -n togglemaster -w

# Terminal 2: Teste de carga
hey -z 3m -c 30 http://<INGRESS_URL>/evaluate
```

- Explique o HPA
- Mostre replicas aumentando

#### 5. Demonstração de Funcionalidades (1-2 minutos)

```bash
# Criar e avaliar flag
curl -X POST http://<INGRESS>/flags -d '{"name":"demo","enabled":true}'
curl -X POST http://<INGRESS>/evaluate -d '{"flagName":"demo","userId":"user1"}'
```

#### 6. Conclusão (1 minuto)

- Tecnologias utilizadas
- Desafios superados
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
- [ ] Cluster criado e ativo
- [ ] Node Group criado
- [ ] kubectl conectado
- [ ] Metrics Server instalado
- [ ] Nginx Ingress instalado
- [ ] Namespace criado
- [ ] Secrets criados
- [ ] ConfigMap criado
- [ ] Deployments aplicados
- [ ] Services criados
- [ ] Ingress criado
- [ ] HPA criado

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

## Limpeza (Após Apresentação)

```bash
# Kubernetes
kubectl delete namespace togglemaster

# AWS (via console)
# Deletar: EKS cluster, RDS, ElastiCache, DynamoDB table, SQS queue
```

---

**Boa sorte! 🚀**
