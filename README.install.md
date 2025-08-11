# 📦 설치 가이드 (Installation Guide)

Next.js 15 기반 커뮤니티 플랫폼을 위한 패키지 설치 가이드입니다.

## 🚀 빠른 시작

```bash
# 프로젝트 클론
git clone <repository-url>
cd webcomm

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 데이터베이스 설정
npx prisma migrate deploy
npx prisma generate
npm run seed

# 개발 서버 실행
npm run dev
```

## 📚 의존성 패키지 상세

### 🏗️ 핵심 프레임워크

```bash
# Next.js (이미 package.json에 포함)
npm install next@latest react react-dom

# TypeScript 지원
npm install --save-dev typescript @types/react @types/node
```

### 🗄️ 데이터베이스 & ORM

```bash
# Prisma ORM
npm install @prisma/client
npm install prisma --save-dev

# PostgreSQL 드라이버
npm install pg
npm install --save-dev @types/pg
```

**사용법:**

```bash
# 개발 환경 DB 동기화
npx prisma db push

# 프로덕션 마이그레이션
npx prisma migrate deploy

# DB 초기화 (주의: 모든 데이터 삭제)
npx prisma migrate reset
```

### 🎨 스타일링

```bash
# SCSS 지원
npm install sass
```

### 🌐 HTTP 클라이언트

```bash
# Axios - API 요청
npm install axios
```

### 🔐 인증 & 보안

```bash
# JWT 토큰 처리
npm install jsonwebtoken jwt-decode
npm install --save-dev @types/jsonwebtoken @types/jwt-decode

# 비밀번호 해싱
npm install bcrypt
npm install --save-dev @types/bcrypt

# Next.js Edge Runtime용 JWT
npm install jose

# reCAPTCHA
npm install react-google-recaptcha

# 쿠키 관리
npm install js-cookie
npm install --save-dev @types/js-cookie
```

### 📧 이메일 서비스

```bash
# Nodemailer (기본)
npm install nodemailer
npm install --save-dev @types/nodemailer

# Resend (권장 - 더 나은 성능)
npm install resend
```

### ☁️ 클라우드 서비스

```bash
# AWS S3 파일 업로드
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 🚦 API 보안 & 제한

```bash
# Rate Limiting
npm install @upstash/ratelimit redis
```

### 📱 푸시 알림

```bash
# 웹 푸시 알림
npm install web-push
npm install --save-dev @types/web-push
```

### ✏️ 리치 텍스트 에디터 (Tiptap)

```bash
# 기본 에디터
npm install @tiptap/react @tiptap/starter-kit

# 확장 기능들
npm install @tiptap/extension-link           # 링크
npm install @tiptap/extension-youtube        # YouTube 임베드
npm install @tiptap/extension-code-block-lowlight  # 코드 블록
npm install @tiptap/extension-image          # 이미지
npm install @tiptap/extension-video          # 비디오
npm install @tiptap/extension-mention        # 멘션 (@username)
npm install @tiptap/extension-text-style     # 텍스트 스타일
npm install @tiptap/extension-color          # 색상
npm install @tiptap/extension-highlight      # 하이라이트
npm install @tiptap/extension-text-align     # 텍스트 정렬
npm install @tiptap/extension-underline      # 밑줄
```

### 🎭 UI 컴포넌트

```bash
# Heroicons 아이콘
npm install @heroicons/react
```

### 🛠️ 개발 도구

```bash
# ESLint
npm install --save-dev eslint

# TypeScript 개발 환경
npm install --save-dev ts-node typescript
```

## 🏷️ 패키지별 용도

| 패키지               | 용도               | 필수도 |
| -------------------- | ------------------ | ------ |
| `@prisma/client`     | 데이터베이스 ORM   | ⭐⭐⭐ |
| `axios`              | HTTP 요청          | ⭐⭐⭐ |
| `jsonwebtoken`       | JWT 인증           | ⭐⭐⭐ |
| `bcrypt`             | 비밀번호 암호화    | ⭐⭐⭐ |
| `sass`               | CSS 전처리기       | ⭐⭐⭐ |
| `@tiptap/react`      | 리치 텍스트 에디터 | ⭐⭐   |
| `web-push`           | 푸시 알림          | ⭐⭐   |
| `resend`             | 이메일 발송        | ⭐⭐   |
| `@aws-sdk/client-s3` | 파일 업로드        | ⭐⭐   |
| `@upstash/ratelimit` | API 제한           | ⭐     |

## 🔧 설치 후 설정

### 1. 환경 변수 설정

```bash
# .env.local 파일 생성
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
RESEND_API_KEY="your-resend-key"
```

### 2. 데이터베이스 초기화

```bash
# 스키마 적용
npx prisma migrate deploy

# 클라이언트 생성
npx prisma generate

# 초기 데이터 입력
npm run seed
```

### 3. 개발 환경 실행

```bash
# 메인 애플리케이션
npm run dev

# SSE 서버 (별도 터미널)
cd stream
npm install
npm start
```

## 📋 패키지 업데이트

```bash
# 모든 패키지 최신 버전 확인
npm outdated

# 주요 패키지 업데이트
npm update @prisma/client prisma
npm update next react react-dom

# Tiptap 패키지 일괄 업데이트
npm update @tiptap/react @tiptap/starter-kit @tiptap/extension-*
```

## 🚨 주의사항

### 1. **Edge Runtime 호환성**

- `jsonwebtoken` → `jose` 사용 (middleware에서)
- Node.js 전용 패키지는 API Routes에서만 사용

### 2. **TypeScript 타입**

- JavaScript 패키지 사용 시 `@types/` 패키지 설치 필요

### 3. **환경별 설정**

- 개발: `npx prisma db push`
- 프로덕션: `npx prisma migrate deploy`

### 4. **버전 호환성**

- Next.js 15와 React 18+ 사용
- Node.js 18+ 권장

## 🔍 트러블슈팅

### 일반적인 문제들

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# Node modules 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 캐시 초기화
rm -rf .next
npm run build
```

### 개발 환경 문제

```bash
# 포트 충돌 시
npm run dev -- -p 3001

# 데이터베이스 연결 문제
npx prisma studio  # DB 상태 확인
```

---

📌 **참고**: 이 가이드는 Next.js 15 App Router 기반으로 작성되었습니다. 프로젝트 요구사항에 따라 일부 패키지는 선택적으로 설치할 수 있습니다.
