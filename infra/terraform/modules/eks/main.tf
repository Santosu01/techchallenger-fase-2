resource "aws_eks_cluster" "this" {
  name     = "${var.cluster_name}-${var.environment}"
  role_arn = var.cluster_role_arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-${var.environment}"
  })
}

resource "aws_eks_node_group" "default" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-${var.environment}-ng"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.instance_types
  ami_type        = var.ami_type

  scaling_config {
    desired_size = var.desired_size
    min_size     = var.min_size
    max_size     = var.max_size
  }

  update_config {
    max_unavailable = 1
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-${var.environment}-ng"
  })

  depends_on = [aws_eks_cluster.this]
}
