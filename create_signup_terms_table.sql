-- Vercel 데이터베이스에서 실행할 SQL

-- signup_terms 테이블이 존재하지 않는 경우에만 생성
CREATE TABLE IF NOT EXISTS "signup_terms" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "signup_terms_pkey" PRIMARY KEY ("id")
);

-- 기본 데이터 삽입 (선택적)
INSERT INTO "signup_terms" ("content", "updated_at") 
VALUES ('기본 가입약관 내용입니다.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
