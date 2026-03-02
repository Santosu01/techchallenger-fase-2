# Dockerfile para o analytics-service (Python)

FROM python:3.12-slim

WORKDIR /app

# Instala dependências do sistema necessárias e wget para healthcheck
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Cria um usuário não-root por segurança
RUN adduser --disabled-password --gecos "" appuser

# Copia requirements e instala primeiro para melhor aproveitamento do cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código fonte
COPY . .

# Alterar a propriedade dos arquivos para o usuário não-root ANTES de trocar de usuário
RUN chown -R appuser:appuser /app

# Trocar para o usuário não-root
USER appuser

# Expõe a porta do Flask (Health Check)
EXPOSE 8006

# Roda com Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8006", "app:app"]
