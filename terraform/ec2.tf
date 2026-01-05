# 1. EC2용 IAM 역할(Role) 생성: S3 접근 권한을 부여하기 위함
resource "aws_iam_role" "ec2_role" {
  name = "cheers-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# 2. 이전에 만든 S3 Full Access 정책을 역할에 연결
resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.s3_full_access.arn
}

# 3. EC2 인스턴스에 역할을 부여하기 위한 프로파일 생성
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "cheers-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# 4. EC2 인스턴스 생성
resource "aws_instance" "app_server" {
  # 서울 리전 Ubuntu 22.04 LTS 최신 AMI (확인 필수)
  ami           = "ami-040c33c6a51fd5d96" 
  instance_type = "t2.micro"

  # [중요] 본인이 보유한 .pem 키 파일의 이름을 확장자 제외하고 입력하세요
  key_name      = "key_pair" 

  # network.tf에서 정의한 보안 그룹 연결
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  
  # 위에서 만든 IAM 프로파일 연결 (S3 접근 가능하게 함)
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  # 인스턴스 시작 시 실행될 스크립트 (Docker 자동 설치)
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              # ubuntu 사용자가 docker 명령어를 사용할 수 있게 권한 부여
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "Cheers-App-Server"
  }
}

# 5. 고정 IP(Elastic IP) 할당
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}

# 6. 완료 후 접속에 필요한 IP 출력
output "public_ip" {
  value = aws_eip.app_eip.public_ip
}