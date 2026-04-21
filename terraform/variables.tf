variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "togglemaster"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# VPC
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# EKS
variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "togglemaster-cluster"
}

# RDS
variable "db_username" {
  description = "RDS database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "RDS database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

# Redis
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

# DynamoDB
variable "dynamodb_read_capacity" {
  description = "DynamoDB read capacity"
  type        = number
  default     = 5
}

variable "dynamodb_write_capacity" {
  description = "DynamoDB write capacity"
  type        = number
  default     = 5
}

# SQS
variable "sqs_visibility_timeout" {
  description = "SQS visibility timeout in seconds"
  type        = number
  default     = 300
}
