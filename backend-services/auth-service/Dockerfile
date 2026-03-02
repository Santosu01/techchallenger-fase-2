# Dockerfile para o auth-service (Go)

# Stage 1: Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copia dependências primeiro para melhor aproveitamento do cache
COPY go.mod go.sum ./
RUN go mod download

# Copia o restante do código fonte
COPY . .

# Compila o binário
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Run
FROM alpine:3.19

WORKDIR /app

# Instala ferramentas necessárias (wget para healthcheck)
RUN apk add --no-cache wget
RUN adduser -D appuser
USER appuser

# Copia apenas o binário compilado do estágio anterior
COPY --from=builder /app/main .

EXPOSE 8001

CMD ["./main"]
