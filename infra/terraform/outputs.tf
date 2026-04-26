output "vpc_id" {
  value = module.network.vpc_id
}

output "public_subnet_ids" {
  value = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.network.private_subnet_ids
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_security_group_id" {
  value = module.eks.cluster_security_group_id
}

output "rds_endpoints" {
  value = module.data.rds_endpoints
}

output "redis_endpoint" {
  value = module.data.redis_primary_endpoint_address
}

output "dynamodb_table_name" {
  value = module.data.dynamodb_table_name
}

output "sqs_queue_url" {
  value = module.data.analytics_sqs_queue_url
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}
