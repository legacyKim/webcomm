# 🚀 Prisma 마이그레이션 완벽 가이드

## 📋 목차

1. [기본 원칙](#기본-원칙)
2. [개발 워크플로우](#개발-워크플로우)
3. [운영 배포 전략](#운영-배포-전략)
4. [문제 해결 방법](#문제-해결-방법)
5. [응급 처치 스크립트](#응급-처치-스크립트)

## 🎯 기본 원칙

### ✅ DO (해야 할 것들)

- **항상 로컬에서 먼저 테스트**
- **마이그레이션 파일은 절대 수정 금지** (배포 후)
- **백업 먼저, 배포 나중에**
- **단계별 점진적 변경**

### ❌ DON'T (하지 말아야 할 것들)

- 배포된 마이그레이션 파일 직접 수정
- 프로덕션에서 직접 `prisma db push` 사용
- 스키마 대규모 변경을 한 번에

## 🔄 개발 워크플로우

### 1. 스키마 변경 시

```bash
# 1단계: 스키마 수정 (schema.prisma)
# 2단계: 마이그레이션 생성
npx prisma migrate dev --name 변경사항명

# 3단계: 로컬 테스트
npm run dev

# 4단계: 문제없으면 커밋
git add .
git commit -m "feat: add new fields"
git push
```

### 2. 안전한 스키마 변경 패턴

```prisma
// ✅ 안전한 변경들
- 새 컬럼 추가 (nullable 또는 default 값 포함)
- 새 테이블 추가
- 인덱스 추가
- 옵셔널 관계 추가

// ⚠️ 주의가 필요한 변경들
- 컬럼 삭제
- 컬럼 타입 변경
- NOT NULL 제약조건 추가
- 테이블 삭제
```

## 🚀 운영 배포 전략

### 1. Zero-Downtime 배포

```bash
# 단계별 배포 전략
# 1단계: 새 컬럼 추가 (nullable)
# 2단계: 애플리케이션 업데이트
# 3단계: 데이터 마이그레이션
# 4단계: 제약조건 추가 (필요시)
```

### 2. 롤백 가능한 마이그레이션

```sql
-- 항상 IF NOT EXISTS 사용
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "new_field" TEXT;

-- 안전한 인덱스 추가
CREATE INDEX IF NOT EXISTS "idx_name" ON "table"("column");
```

## 🆘 문제 해결 방법

### 1. 마이그레이션 실패 시

```bash
# 실패한 마이그레이션 확인
npx prisma migrate status

# 실패한 마이그레이션 해결
npx prisma migrate resolve --applied 마이그레이션명
# 또는
npx prisma migrate resolve --rolled-back 마이그레이션명
```

### 2. 스키마 불일치 시

```bash
# 현재 DB 상태로 스키마 업데이트
npx prisma db pull

# 스키마에 맞춰 DB 업데이트 (개발환경만!)
npx prisma db push
```

### 3. 데이터 손실 위험 시

```bash
# 1. 백업 생성
pg_dump $DATABASE_URL > backup.sql

# 2. 마이그레이션 시뮬레이션
npx prisma migrate diff --from-empty --to-schema-datamodel schema.prisma

# 3. 안전 확인 후 배포
```

## 🛠️ 응급 처치 스크립트

### 1. 즉시 사용 가능한 API 템플릿

```javascript
// /api/emergency-fix/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(request) {
  const { secret, sql } = await request.json();

  if (secret !== process.env.EMERGENCY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = new PrismaClient();
    const result = await prisma.$executeRawUnsafe(sql);
    await prisma.$disconnect();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2. 마이그레이션 상태 체크 API

```javascript
// /api/migration-status/route.js
export async function GET() {
  try {
    const prisma = new PrismaClient();
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, logs 
      FROM _prisma_migrations 
      ORDER BY started_at DESC 
      LIMIT 10;
    `;

    return NextResponse.json({ migrations });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 📦 package.json 스크립트 추천

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset",
    "db:status": "prisma migrate status",
    "db:backup": "pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql",
    "db:studio": "prisma studio",
    "vercel-build": "prisma migrate deploy || echo 'Migration failed, continuing...' && prisma generate && next build"
  }
}
```

## 🔥 긴급상황 대응

### 1. 마이그레이션 완전 실패 시

```bash
# 1. 실패한 마이그레이션 롤백 표시
DATABASE_URL="운영DB_URL" npx prisma migrate resolve --rolled-back 실패한마이그레이션명

# 2. 수동 SQL 적용
psql $DATABASE_URL -c "필요한 SQL 구문"

# 3. 새로운 마이그레이션 재배포
```

### 2. 데이터베이스 완전 초기화 (최후의 수단)

```bash
# ⚠️ 주의: 모든 데이터 삭제됨
npx prisma migrate reset --force
npx prisma db seed  # 시드 데이터 있는 경우
```

## 💡 모니터링 권장사항

### 1. 환경변수 설정

```env
# .env
EMERGENCY_SECRET=your-super-secret-key
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url  # Connection pooling 우회용
```

### 2. 알림 설정

- Vercel 배포 실패 알림 설정
- 데이터베이스 모니터링 툴 연동
- 마이그레이션 로그 수집

## 🎯 체크리스트

### 배포 전

- [ ] 로컬에서 마이그레이션 테스트 완료
- [ ] 백업 생성 확인
- [ ] 롤백 계획 수립
- [ ] 다운타임 계획 공유

### 배포 후

- [ ] 마이그레이션 상태 확인
- [ ] 애플리케이션 정상 작동 확인
- [ ] 임시 API 엔드포인트 삭제
- [ ] 로그 모니터링

이 가이드를 팀 위키나 README에 저장해두시면 앞으로 Prisma 관련 문제가 발생했을 때 체계적으로 대응할 수 있을 것입니다! 🚀
