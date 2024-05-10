
resource "aws_instance" "gwak26" {
  ami           = "ami-01ed8ade75d4eee2f"
  instance_type = "t2.micro"
  key_name = aws_key_pair.cicd_make_keypair.key_name

  vpc_security_group_ids = [aws_security_group.gwak26_allow_ssh.id]

  tags = {
    Name = "gwak26"
  }
}
output "gwak26_public_ip" {
    value = aws_instance.gwak26.public_ip
}

resource "aws_security_group" "gwak26_allow_ssh" {
    name        = "gwak26_allow_ssh"
    description = "Allow SSH inbound traffic"

    ingress {
      from_port   = 22 
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port   = 8080 
        to_port     = 8080
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
}
