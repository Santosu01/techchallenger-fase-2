variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "rds_instance_class" {
  type = string
}

variable "rds_allocated_storage" {
  type = number
}

variable "rds_master_username" {
  type = string
}

variable "rds_master_password" {
  type      = string
  sensitive = true
}

variable "redis_node_type" {
  type = string
}

variable "redis_num_cache_nodes" {
  type = number
}

variable "dynamodb_table_name" {
  type = string
}

variable "analytics_sqs_queue_name" {
  type = string
}

variable "tags" {
  type = map(string)
}
