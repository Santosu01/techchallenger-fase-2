output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "rds_auth_endpoint" {
  description = "RDS Auth database endpoint"
  value       = module.rds_auth.db_instance_endpoint
  sensitive   = true
}

output "rds_flags_endpoint" {
  description = "RDS Flags database endpoint"
  value       = module.rds_flags.db_instance_endpoint
  sensitive   = true
}

output "rds_targeting_endpoint" {
  description = "RDS Targeting database endpoint"
  value       = module.rds_targeting.db_instance_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.redis.primary_endpoint_address
  sensitive   = true
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.dynamodb.table_name
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = module.sqs.queue_url
}

output "sqs_queue_arn" {
  description = "SQS queue ARN"
  value       = module.sqs.queue_arn
}
