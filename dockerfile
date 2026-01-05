# 1. 가볍고 안정적인 Node.js 18 버전 사용
FROM node:18-alpine

# 2. 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 3. 라이브러리 설치를 위해 package 파일들 먼저 복사
COPY package*.json ./

# 4. 종속성 라이브러리 설치
RUN npm install

# 5. 소스 코드 전체 복사 (src 폴더 포함)
COPY . .

# 6. 앱이 사용할 포트 번호 명시
EXPOSE 3000

# 7. 서버 실행 명령어
CMD ["node", "src/app.js"]