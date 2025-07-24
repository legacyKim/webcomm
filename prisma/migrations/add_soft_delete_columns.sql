-- 회원 탈퇴 및 삭제를 위한 숨김 처리 컬럼 추가

-- members 테이블에 숨김 처리 컬럼 추가
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS withdrawal_reason VARCHAR(255) NULL;

-- posts 테이블에 숨김 처리 컬럼 추가  
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- comments 테이블에 숨김 처리 컬럼 추가
ALTER TABLE comments  
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- 숨김 처리된 데이터 조회를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_members_deleted ON members(deleted);
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(deleted);  
CREATE INDEX IF NOT EXISTS idx_comments_deleted ON comments(deleted);

-- 탈퇴한 회원들을 위한 권한 레벨 4 추가 (기존: 0=관리자, 1=일반, 2=경고, 3=정지)
-- authority = 4 는 탈퇴 회원을 의미

-- 기존 쿼리들이 숨김 처리된 데이터를 제외하도록 수정이 필요합니다.
-- 예시:
-- SELECT * FROM members WHERE deleted = FALSE;
-- SELECT * FROM posts WHERE deleted = FALSE;
-- SELECT * FROM comments WHERE deleted = FALSE;
