resource "aws_ecr_repository" "app_repo" {
  name                 = "cheers-app" # 저장소 이름
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true # 이미지 취약점 자동 검사
  }
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app_repo.repository_url
}