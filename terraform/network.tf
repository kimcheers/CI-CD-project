# 1. 기본 VPC 사용 (발표용으로 간단하게 구성 시)
resource "aws_default_vpc" "default" {}

# 2. 보안 그룹 (3000번 포트 및 SSH 열기)
resource "aws_security_group" "app_sg" {
  name        = "app-security-group"
  description = "Allow port 3000 and 22"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # 어디서나 접속 가능 (테스트용)
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # SSH 접속용
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # 외부로 나가는 통로는 다 열어둠
  }
}