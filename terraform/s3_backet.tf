# 1. S3 버킷 생성
resource "aws_s3_bucket" "cheers_bucket" {
  bucket = "cheers-09" 
  force_destroy = true # 삭제 시 내용물도 같이 삭제 (테스트용)
}

# 2. 퍼블릭 액세스 설정 (이미지 조회를 위해 ACL은 허용)
resource "aws_s3_bucket_public_access_block" "cheers_access" {
  bucket = aws_s3_bucket.cheers_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 3. IAM 정책 정의 (읽기 + 쓰기 + 목록 확인)
resource "aws_iam_policy" "s3_full_access" {
  name        = "CheersS3FullAccess"
  description = "Allow app to read and write to S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",     # 업로드 (이미지, 게시글 저장)
          "s3:GetObject",     # 읽기 (이미지 보기, 게시글 불러오기)
          "s3:ListBucket"     # 목록 확인 (갤러리 리스트 가져오기)
        ]
        Effect   = "Allow"
        Resource = [
          "${aws_s3_bucket.cheers_bucket.arn}",
          "${aws_s3_bucket.cheers_bucket.arn}/*"
        ]
      }
    ]
  })
}