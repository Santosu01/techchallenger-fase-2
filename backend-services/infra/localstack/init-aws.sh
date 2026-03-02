#!/bin/bash
echo "Inicializando recursos AWS no LocalStack..."

# Cria a fila SQS
awslocal sqs create-queue --queue-name ToggleMasterQueue

echo "Recursos criados com sucesso!"
