# Dockerfile para o evaluation-service (Go)

# Stage 1: Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copia dependências primeiro para melhor aproveitamento do cache
COPY go.mod go.sum ./
RUN go mod download

# Copia o restante do código
COPY . .

# Compila
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Run
FROM alpine:3.19

# Instala ferramentas de rede, cliente postgres e wget para validação/healthcheck
RUN apk add --no-cache postgresql-client netcat-openbsd wget

WORKDIR /app

# Cria um usuário não-root por segurança
RUN adduser -D appuser

# Copia o binário do builder
COPY --from=builder /app/main .

# Garante que o appuser tenha permissão
RUN chown appuser:appuser main

USER appuser

EXPOSE 8004

CMD ["./main"]
