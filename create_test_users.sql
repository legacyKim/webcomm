-- 게시판 데이터 먼저 삽입
INSERT INTO "boards" (board_name, url_slug) VALUES 
('개발', 'dev'),
('React', 'react'),
('TypeScript', 'typescript'),
('프로그래밍', 'programming'),
('CSS', 'css')
ON CONFLICT (url_slug) DO NOTHING;

-- 테스트 사용자 데이터 삽입
INSERT INTO "members" (
  username, 
  user_nickname, 
  password, 
  email, 
  profile,
  bio,
  location,
  website,
  authority,
  total_likes_received,
  is_online,
  last_seen,
  created_at
) VALUES 
(
  'tester02',
  '테스터02',
  '$2a$10$example.hash.password', -- 실제로는 해시된 비밀번호
  'tester02@example.com',
  '/profile/basic.png',
  '안녕하세요! tester02입니다. 웹 개발에 관심이 많아요.',
  '서울, 대한민국',
  'https://github.com/tester02',
  0,
  87,
  true,
  NOW(),
  NOW()
),
(
  'developer01',
  '개발자01',
  '$2a$10$example.hash.password2',
  'dev01@example.com',
  '/profile/basic.png',
  '풀스택 개발자입니다. React와 Node.js를 주로 사용해요.',
  '부산, 대한민국',
  'https://github.com/developer01',
  0,
  156,
  false,
  NOW() - INTERVAL '1 hour',
  NOW()
),
(
  'coder99',
  '코더99',
  '$2a$10$example.hash.password3',
  'coder99@example.com',
  NULL,
  '백엔드 개발을 좋아하는 코더입니다.',
  '대구, 대한민국',
  NULL,
  0,
  234,
  true,
  NOW(),
  NOW()
),
(
  'frontend_master',
  '프론트엔드마스터',
  '$2a$10$example.hash.password4',
  'frontmaster@example.com',
  '/profile/basic.png',
  'UI/UX와 프론트엔드 개발 전문가입니다.',
  '인천, 대한민국',
  'https://frontend-master.dev',
  1,
  389,
  false,
  NOW() - INTERVAL '30 minutes',
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- 팔로우 관계 데이터 (사용자 생성 후)
INSERT INTO "follows" (follower_id, following_id, created_at) 
SELECT 
  m1.id as follower_id,
  m2.id as following_id,
  NOW() as created_at
FROM "members" m1, "members" m2
WHERE (m1.username = 'developer01' AND m2.username = 'tester02')
   OR (m1.username = 'coder99' AND m2.username = 'tester02')
   OR (m1.username = 'frontend_master' AND m2.username = 'tester02')
   OR (m1.username = 'tester02' AND m2.username = 'developer01')
   OR (m1.username = 'tester02' AND m2.username = 'frontend_master')
ON CONFLICT (follower_id, following_id) DO NOTHING;
