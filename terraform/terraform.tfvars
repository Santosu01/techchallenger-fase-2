# AWS Configuration
aws_region   = "us-east-1"
project_name = "togglemaster"
environment  = "production"

# VPC Configuration
vpc_cidr        = "10.0.0.0/16"
public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]

# EKS Configuration
cluster_name = "togglemaster-cluster"

# RDS Configuration
# ⚠️ IMPORTANTE: Altere para senhas fortes
db_username        = "admin"
db_password        = "ChangeMe@123456"  # Altere para uma senha forte
db_instance_class  = "db.t3.micro"

# Redis Configuration
redis_node_type = "cache.t3.micro"

# DynamoDB Configuration
dynamodb_read_capacity  = 5
dynamodb_write_capacity = 5

# SQS Configuration
sqs_visibility_timeout = 300
