#!/bin/bash

REGION="us-east-1"
DB_CLASS="db.t3.micro"
ENGINE="postgres"
ENGINE_VERSION="13.9"
STORAGE=20
USERNAME="admin"
PASSWORD="Tech654987"

echo "Criando AUTH DB..."

aws rds create-db-instance \
  --db-instance-identifier togglemaster-auth \
  --db-instance-class $DB_CLASS \
  --engine $ENGINE \
  --engine-version $ENGINE_VERSION \
  --allocated-storage $STORAGE \
  --master-username $USERNAME \
  --master-user-password $PASSWORD \
  --db-name auth_db \
  --publicly-accessible \
  --no-multi-az \
  --backup-retention-period 0 \
  --region $REGION

echo "Criando FLAG DB..."

aws rds create-db-instance \
  --db-instance-identifier togglemaster-flag \
  --db-instance-class $DB_CLASS \
  --engine $ENGINE \
  --engine-version $ENGINE_VERSION \
  --allocated-storage $STORAGE \
  --master-username $USERNAME \
  --master-user-password $PASSWORD \
  --db-name flag_db \
  --publicly-accessible \
  --no-multi-az \
  --backup-retention-period 0 \
  --region $REGION

echo "Criando ANALYTICS DB..."

aws rds create-db-instance \
  --db-instance-identifier togglemaster-analytics \
  --db-instance-class $DB_CLASS \
  --engine $ENGINE \
  --engine-version $ENGINE_VERSION \
  --allocated-storage $STORAGE \
  --master-username $USERNAME \
  --master-user-password $PASSWORD \
  --db-name analytics_db \
  --publicly-accessible \
  --no-multi-az \
  --backup-retention-period 0 \
  --region $REGION

echo "Criação dos bancos iniciada."