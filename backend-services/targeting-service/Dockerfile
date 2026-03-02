# Usar uma imagem base leve de Python
FROM python:3.12-slim

# Evitar que o Python gere arquivos .pyc e garantir que o log seja enviado para o terminal
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema para o psycopg2 e wget para healthcheck
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Cria um usuário não-root por segurança
RUN adduser --disabled-password --gecos "" appuser

# Copiar arquivos de dependências primeiro para melhor aproveitamento do cache
COPY requirements.txt .

# Instalar dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código
COPY . .

# Alterar a propriedade dos arquivos para o usuário não-root ANTES de trocar de usuário
RUN chown -R appuser:appuser /app

# Trocar para o usuário não-root
USER appuser

# Expor a porta definida (padrão 8003)
EXPOSE 8003

# Comando para rodar a aplicação usando gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8003", "app:app"]
