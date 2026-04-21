terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Módulos
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr           = var.vpc_cidr
  public_subnets    = var.public_subnets
  private_subnets   = var.private_subnets
  environment        = var.environment
  project_name       = var.project_name
}

module "eks" {
  source = "./modules/eks"
  
  cluster_name           = var.cluster_name
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  node_role_arn          = data.aws_iam_role.lab_role.arn
  cluster_role_arn       = data.aws_iam_role.lab_role.arn
  environment            = var.environment
  project_name           = var.project_name
}

module "rds_auth" {
  source = "./modules/rds"
  
  identifier             = "${var.project_name}-auth-db"
  database_name          = "auth_db"
  username               = var.db_username
  password               = var.db_password
  instance_class         = var.db_instance_class
  vpc_security_group_ids = [module.vpc.security_group_id]
  db_subnet_group_name   = module.vpc.db_subnet_group_name
  environment            = var.environment
  project_name           = var.project_name
}

module "rds_flags" {
  source = "./modules/rds"
  
  identifier             = "${var.project_name}-flags-db"
  database_name          = "flags_db"
  username               = var.db_username
  password               = var.db_password
  instance_class         = var.db_instance_class
  vpc_security_group_ids = [module.vpc.security_group_id]
  db_subnet_group_name   = module.vpc.db_subnet_group_name
  environment            = var.environment
  project_name           = var.project_name
}

module "rds_targeting" {
  source = "./modules/rds"
  
  identifier             = "${var.project_name}-targeting-db"
  database_name          = "targeting_db"
  username               = var.db_username
  password               = var.db_password
  instance_class         = var.db_instance_class
  vpc_security_group_ids = [module.vpc.security_group_id]
  db_subnet_group_name   = module.vpc.db_subnet_group_name
  environment            = var.environment
  project_name           = var.project_name
}

module "redis" {
  source = "./modules/redis"
  
  cluster_id             = "${var.project_name}-cache"
  engine_version         = "7.0"
  node_type              = var.redis_node_type
  num_cache_nodes        = 1
  subnet_group_name      = module.vpc.elasticache_subnet_group_name
  security_group_ids     = [module.vpc.security_group_id]
  environment            = var.environment
  project_name           = var.project_name
}

module "dynamodb" {
  source = "./modules/dynamodb"
  
  table_name             = "${var.project_name}-analytics"
  hash_key               = "requestId"
  read_capacity          = var.dynamodb_read_capacity
  write_capacity         = var.dynamodb_write_capacity
  environment            = var.environment
  project_name           = var.project_name
}

module "sqs" {
  source = "./modules/sqs"
  
  queue_name             = "${var.project_name}-analytics-queue"
  visibility_timeout     = var.sqs_visibility_timeout
  environment            = var.environment
  project_name           = var.project_name
}

# Data source para LabRole (AWS Academy)
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}
