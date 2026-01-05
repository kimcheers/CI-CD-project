const express = require('express');
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");

const app = express();
const upload = multer();

/**
 * [중요] AWS S3 클라이언트 설정
 * - 로컬 테스트 시: AWS CLI(`aws configure`) 설정 기반으로 작동
 * - EKS 배포 시: 테라폼으로 설정할 IAM Role(IRSA)을 통해 별도 키 없이 자동 인증
 */
const s3Client = new S3Client({ region: "ap-northeast-2" });
const BUCKET_NAME = "cheers-09";

// 현재 파일 위치(src/)를 기준으로 public 폴더 경로 설정
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));
app.use(express.json());

// [기능 1] 이미지 업로드 (S3 저장)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send("파일이 없습니다.");

    const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    });

    try {
        await s3Client.send(command);
        // 업로드 후 메인으로 리다이렉트
        res.send("<script>alert('S3 전송 완료!'); location.href='/';</script>");
    } catch (err) {
        console.error("S3 Upload Error:", err);
        res.status(500).send("에러: " + err.message);
    }
});

// [기능 2] 이미지 목록 가져오기 (갤러리)
app.get('/api/images', async (req, res) => {
    const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'uploads/'
    });

    try {
        const data = await s3Client.send(command);
        const imageUrls = (data.Contents || [])
            .filter(f => f.Size > 0)
            .map(f => ({
                url: `https://${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${f.Key}`,
                name: f.Key.replace('uploads/', '')
            }));
        res.json(imageUrls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [기능 3] 게시글 텍스트 S3 저장
app.post('/api/posts', async (req, res) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'posts.txt',
        Body: req.body.content,
        ContentType: 'text/plain'
    });

    try {
        await s3Client.send(command);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [기능 4] 게시글 텍스트 S3 불러오기
app.get('/api/posts', async (req, res) => {
    try {
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: 'posts.txt'
        }));
        const content = await response.Body.transformToString();
        res.json({ content });
    } catch (err) {
        // 파일이 없는 경우 빈 내용 반환
        res.json({ content: "" });
    }
});

// 메인 페이지 라우팅 (경로 오류 해결)
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'hello.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버 가동 중: http://localhost:${PORT}`);
});