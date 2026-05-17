provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile == "" ? null : var.aws_profile
}

terraform {
  backend "s3" {
    # Crie este bucket uma vez na conta (bootstrap) antes do primeiro terraform init.
    bucket       = "242980968921-togglemaster-tfstate"
    key          = "techchallenger/fase3/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
  }
}
