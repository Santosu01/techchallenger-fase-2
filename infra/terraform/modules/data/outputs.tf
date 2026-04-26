output "rds_endpoints" {
  value = {
    for key, instance in aws_db_instance.postgres :
    key => instance.address
  }
}

output "redis_primary_endpoint_address" {
  value = aws_elasticache_cluster.this.cache_nodes[0].address
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.analytics.name
}

output "analytics_sqs_queue_url" {
  value = aws_sqs_queue.analytics.url
}
