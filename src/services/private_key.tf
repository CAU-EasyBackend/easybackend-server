resource "tls_private_key" "cicd_make_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "cicd_make_keypair" {
  key_name   = "cicd_key"
  public_key = tls_private_key.cicd_make_key.public_key_openssh
}

resource "local_file" "cicd_downloads_key" {
  filename = "cicd_key.pem"
  content  = tls_private_key.cicd_make_key.private_key_pem
}