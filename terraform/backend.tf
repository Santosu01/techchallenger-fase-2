terraform {
  backend "s3" {
    bucket = "seu-bucket-terraform-state"
    key    = "togglemaster/terraform.tfstate"
    region = "us-east-1"
    dynamodb_table = "togglemaster-tfstate-lock"
  }
}
