# Tech Challenge Fase 2 - Guia Completo (AWS Academy / EKS)

Este guia contém todos os passos, códigos e explicações necessárias para completar o desafio.

---

## 1. Entregável Local: Docker Compose

### 1.1. Dockerfiles

**Para serviços em Go (auth-service, evaluation-service):**
Crie um arquivo `Dockerfile` na pasta de cada serviço Go.

    FROM golang:1.21-alpine AS builder
    WORKDIR /app
    COPY go.mod go.sum ./
    RUN go mod download
    COPY . .
    RUN go build -o main .

    FROM alpine:latest
    WORKDIR /root/
    COPY --from=builder /app/main .
    EXPOSE 8080
    CMD ["./main"]

**Para serviços em Python (flag-service, targeting-service, analytics-service):**
Crie um arquivo `Dockerfile` na pasta de cada serviço Python.

    FROM python:3.9-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . .
    EXPOSE 8080
    CMD ["python", "app.py"]

### 1.2. Docker Compose

Crie o arquivo `docker-compose.yml` na raiz do projeto.

    version: '3.8'

    services:
      # BANCOS DE DADOS
      postgres-auth:
        image: postgres:13
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: auth_db
        ports: ["5432:5432"]

      postgres-flags:
        image: postgres:13
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: flags_db
        ports: ["5433:5432"]

      postgres-targeting:
        image: postgres:13
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: targeting_db
        ports: ["5434:5432"]

      redis:
        image: redis:alpine
        ports: ["6379:6379"]

      dynamodb-local:
        image: amazon/dynamodb-local:latest
        command: "-jar DynamoDBLocal.jar -sharedDb -inMemory"
        ports: ["8000:8000"]

      # APLICAÇÕES
      auth-service:
        build: ./auth-service
        ports: ["8081:8080"]
        environment:
          DB_HOST: postgres-auth
          DB_USER: user
          DB_PASSWORD: password
          DB_NAME: auth_db
        depends_on: [postgres-auth]

      flag-service:
        build: ./flag-service
        ports: ["8082:8080"]
        environment:
          DB_HOST: postgres-flags
          DB_USER: user
          DB_PASSWORD: password
          DB_NAME: flags_db
        depends_on: [postgres-flags]

      targeting-service:
        build: ./targeting-service
        ports: ["8083:8080"]
        environment:
          DB_HOST: postgres-targeting
          DB_USER: user
          DB_PASSWORD: password
          DB_NAME: targeting_db
        depends_on: [postgres-targeting]

      evaluation-service:
        build: ./evaluation-service
        ports: ["8084:8080"]
        environment:
          REDIS_HOST: redis
        depends_on: [redis]

      analytics-service:
        build: ./analytics-service
        ports: ["8085:8080"]
        environment:
          DYNAMODB_ENDPOINT: http://dynamodb-local:8000
        depends_on: [dynamodb-local]

---

## 2. Provisionamento na Nuvem (Console AWS)

Acesse o Console da AWS Academy. Use a região **us-east-1**.

### 2.1. Bancos de Dados (RDS PostgreSQL)

1. Serviço: **RDS** > Create database.
2. Engine: PostgreSQL. Template: Free tier.
3. Identificador: `auth-db` (repita para `flag-db` e `targeting-db`).
4. Credenciais: Defina usuário/senha e anote.
5. Conectividade: VPC Default. Public Access: Yes.
6. **Anote o Endpoint (URL)** de cada banco.

### 2.2. Cache (ElastiCache Redis)

1. Serviço: **ElastiCache** > Redis clusters > Create.
2. Node: `cache.t3.micro`. Subnet Group: Default.
3. **Anote o Endpoint Primário**.

### 2.3. NoSQL (DynamoDB)

1. Serviço: **DynamoDB** > Create table.
2. Nome: `Analytics`.
3. Partition Key: `requestId` (verifique no código).

### 2.4. Fila (SQS)

1. Serviço: **SQS** > Create queue.
2. Tipo: Standard. Nome: `analytics-queue`.
3. **Anote a URL da fila**.

---

## 3. Registro de Imagens (ECR)

1. Acesse **ECR** > Create repository.
2. Crie 5 repositórios (ex: `auth-service`, `flag-service`, etc.).
3. Clique no repositório > **View push commands**.
4. No terminal, dentro da pasta de cada serviço, execute os comandos:
   - Login
   - Build
   - Tag
   - Push

---

## 4. Cluster Kubernetes (EKS)

### 4.1. Criar o Cluster (Console)

1. Acesse **EKS** > Create cluster.
2. Nome: `tech-challenge-cluster`.
3. **Service Role**: Selecione **LabRole**.
4. Networking: VPC Default. Selecione todas as Subnets.
5. Clique em Create. Aguarde ficar **ACTIVE**.

### 4.2. Criar Node Group (Compute)

1. No cluster criado, vá em **Compute** > Add Node Group.
2. Nome: `ng-workers`.
3. **Node IAM Role**: Selecione **LabRole**.
4. Instance: `t3.small`.
5. Scaling: Min 1, Max 4, Desired 2.

---

## 5. Configuração do Cluster (Kubectl)

Conectando o terminal ao cluster EKS.

### 5.1. Conexão

    aws eks update-kubeconfig --region us-east-1 --name tech-challenge-cluster

### 5.2. Instalar Metric Server

    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

### 5.3. Instalar Nginx Ingress Controller

    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

---

## 6. Manifestos Kubernetes (YAML)

Crie uma pasta `k8s` e salve os arquivos abaixo.

### 1-namespace.yaml

    apiVersion: v1
    kind: Namespace
    metadata:
      name: togglemaster

### 2-secrets.yaml

Gere os valores com: `echo -n "texto" | base64`

    apiVersion: v1
    kind: Secret
    metadata:
      name: app-secrets
      namespace: togglemaster
    type: Opaque
    data:
      POSTGRES_USER: <SEU_USER_EM_BASE64>
      POSTGRES_PASSWORD: <SUA_SENHA_EM_BASE64>

### 3-configmap.yaml

Substitua pelos Endpoints reais do RDS, ElastiCache e SQS.

    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: app-config
      namespace: togglemaster
    data:
      AUTH_DB_HOST: "<ENDPOINT_RDS_AUTH>"
      FLAG_DB_HOST: "<ENDPOINT_RDS_FLAG>"
      TARGETING_DB_HOST: "<ENDPOINT_RDS_TARGETING>"
      REDIS_HOST: "<ENDPOINT_ELASTICACHE>"
      SQS_URL: "<URL_FILA_SQS>"
      DYNAMODB_TABLE: "Analytics"

### 4-deployments.yaml

Repita a estrutura para cada serviço.

    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: auth-service
      namespace: togglemaster
    spec:
      replicas: 1
      selector:
        matchLabels: { app: auth-service }
      template:
        metadata:
          labels: { app: auth-service }
        spec:
          containers:
          - name: auth-service
            image: <SUA_URI_ECR>/auth-service:latest
            ports:
            - containerPort: 8080
            env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: AUTH_DB_HOST
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: POSTGRES_USER
            resources:
              requests: { cpu: "100m", memory: "128Mi" }
              limits: { cpu: "500m", memory: "512Mi" }
            livenessProbe:
              httpGet: { path: /health, port: 8080 }
              initialDelaySeconds: 10
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: auth-service
      namespace: togglemaster
    spec:
      selector: { app: auth-service }
      ports:
      - port: 8080
        targetPort: 8080

### 5-ingress.yaml

    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: togglemaster-ingress
      namespace: togglemaster
      annotations:
        kubernetes.io/ingress.class: nginx
    spec:
      rules:
      - http:
          paths:
          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port: { number: 8080 }

### 6-hpa.yaml

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

---

## 7. Execução e Testes

### Aplicar Manifestos

    kubectl apply -f 1-namespace.yaml
    kubectl apply -f 2-secrets.yaml
    kubectl apply -f 3-configmap.yaml
    kubectl apply -f 4-deployments.yaml
    kubectl apply -f 5-ingress.yaml
    kubectl apply -f 6-hpa.yaml

### Obter URL de Acesso

    kubectl get ingress -n togglemaster

### Testar Escalabilidade

1. Monitorar:

   kubectl get hpa -n togglemaster -w

2. Gerar carga:

   hey -z 2m -c 20 http://<ENDERECO_DO_INGRESS>/evaluate

---

## 8. Roteiro do Vídeo

1. **Local:** Mostre `docker-compose up` e os 9 containers rodando.
2. **Nuvem:** Mostre o Cluster EKS "Active" e Nodes no console AWS.
3. **Pods:** Mostre `kubectl get pods` com status Running.
4. **Acesso:** Mostre uma requisição funcionando (curl ou Postman).
5. **Escalabilidade:** Mostre o HPA subindo as réplicas durante o teste de carga.
6. **Dados:** Mostre a tabela DynamoDB com dados inseridos.
7. **Explicação Técnica:**
   - Arquitetura de Microsserviços.
   - Uso da LabRole (Workaround da Academy).
   - Diferença dos Bancos:
     - RDS: Dados relacionais.
     - Redis: Cache em memória.
     - DynamoDB: NoSQL.
