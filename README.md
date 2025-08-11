# 🌐 Community Platform

Next.js 15 기반으로 구축된 현대적인 웹 커뮤니티 플랫폼입니다.

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [아키텍처 개요](#-아키텍처-개요)
- [설치 및 설정](#-설치-및-설정)
- [프로젝트 구조](#-프로젝트-구조)
- [핵심 API](#-핵심-api)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [배포](#-배포)

## ✨ 주요 기능

### 🔐 사용자 인증 및 관리

- **JWT 기반 인증**: 토큰 기반 무상태 인증
- **이메일 인증**: Resend 서비스를 통한 회원가입 확인
- **Google reCAPTCHA v3**: 봇 방지 및 보안 강화
<!-- - **계정 보안**: 로그인 실패 시 자동 잠금, 제한 기간 설정 -->
- **프로필 관리**: 닉네임/이메일 변경 제한 (14일 쿨다운)
- **권한 관리**: Middleware를 통한 페이지별 접근 제어

### 💬 게시판 시스템

- **다중 게시판**: 동적 라우팅으로 무제한 게시판 생성
- **리치 에디터**: Tiptap 기반 WYSIWYG 에디터
  - 이미지/동영상 업로드 (AWS S3 + CloudFront)
  - 코드 하이라이팅
  - YouTube 동영상 임베드
  - 멘션(@) 기능
- **공지사항**: 게시판별 공지 고정 기능
- **베스트 게시물**: 인기도 알고리즘 기반 자동 선별

### 👥 소셜 기능

- **팔로우 시스템**: 사용자 간 팔로우/언팔로우
- **차단 기능**: 원치 않는 사용자 차단
- **댓글 시스템**: 대댓글 지원
- **좋아요/싫어요**: 게시물 및 댓글 평가
- **신고 기능**: 상세 사유와 함께 신고 처리
- **쪽지 시스템**: 사용자 간 개인 메시지

### 🔔 실시간 알림 시스템

- **웹 푸시 알림**: Service Worker 기반 브라우저 알림
- **실시간 업데이트**: SSE(Server-Sent Events) + Redis 연동
- **알림 타입**: 댓글, 좋아요, 팔로우, 멘션 등
- **자동 정리**: 읽은 알림 7일 후 자동 삭제

### 🎨 현대적 UI/UX

- **스켈레톤 로딩**: 고정 레이아웃용 (프로필, 게시물)
- **로딩 스피너**: 가변 데이터용 (목록, 댓글)
  <!-- - **Shimmer 애니메이션**: 반짝이는 로딩 효과 -->
  <!-- - **반응형 디자인**: 모바일 퍼스트 접근 -->
- **SEO 최적화**: SSR을 통한 검색엔진 최적화

## 🛠 기술 스택

### Frontend

- **Next.js 15** - React 프레임워크 (App Router)
- **TypeScript** - 정적 타입 검사
- **SCSS** - 스타일링
- **TanStack Query** - 서버 상태 관리
- **Tiptap** - 리치 텍스트 에디터

### Backend

- **Next.js API Routes** - 서버리스 API
- **Prisma** - PostgreSQL ORM 및 마이그레이션 관리
- **JWT** - 인증 토큰
- **bcrypt** - 비밀번호 해싱
- **Node.js** - SSE 서버 (Render 배포)

### Database & Storage

- **PostgreSQL** - 메인 데이터베이스 (Neon 호스팅)
- **Redis** - SSE 알림 캐싱 (Render Redis)
- **AWS S3** - 파일 저장소
- **CloudFront** - 이미지 최적화

### External Services

- **Resend** - 이메일 발송 서비스
- **Google reCAPTCHA v3** - 봇 방지
- **Vercel** - 메인 앱 배포
- **Render** - Node.js 서버 배포

## 🏗 아키텍처 개요

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│   (Vercel)      │    │                  │    │   Services      │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Next.js App   │◄──►│ • API Routes     │◄──►│ • AWS S3        │
│ • SSR Pages     │    │ • Middleware     │    │ • CloudFront    │
│ • Client Query  │    │ • Prisma ORM     │    │ • Resend        │
│ • Service Worker│    │ • JWT Auth       │    │ • reCAPTCHA     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Database      │    │   SSE Server     │
│   (Neon)        │    │   (Render)       │
├─────────────────┤    ├──────────────────┤
│ • PostgreSQL    │◄──►│ • Node.js        │
│ • 19 Tables     │    │ • Redis Cache    │
│ • Prisma Schema │    │ • NOTIFY/LISTEN  │
└─────────────────┘    └──────────────────┘
```

### 데이터 플로우

1. **인증**: JWT 토큰 → Middleware 검증 → API 접근 허용
2. **게시물**: 에디터 → S3 업로드 → DB 저장 → SSR 렌더링
3. **알림**: DB 트리거 → PostgreSQL NOTIFY → Redis → SSE → 클라이언트
4. **이미지**: S3 업로드 → CloudFront 캐싱 → Next.js Image 최적화

## ⚙️ 설치 및 설정

### 1. 저장소 클론

```bash
git clone https://github.com/legacyKim/webcomm.git
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma Client 생성
npx prisma generate

# 시드 데이터 삽입
npm run seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
community/
├── webcomm/                     # 메인 웹 애플리케이션
│   ├── src/
│   │   ├── app/
│   │   │   ├── (site)/             # 메인 사이트
│   │   │   │   ├── board/          # 게시판
│   │   │   │   │   ├── [url_slug]/      # 게시판 목록 동적 라우팅
│   │   │   │   │   │   └── page.tsx              # 게시판 페이지 서버 컴포넌트
│   │   │   │   │   ├── [url_slug]/[id]/          # 게시물 상세
│   │   │   │   │   │   ├── commentEditor.js      # 게시물 상세
│   │   │   │   │   │   ├── CommentTree.tsx       # 게시물 댓글 트리 구조
│   │   │   │   │   │   ├── CommentTreeBuild.tsx  # 게시물 댓글 트리 구조 생성
│   │   │   │   │   │   ├── mention.js            # 유저 언급하기
│   │   │   │   │   │   ├── page.js               # 게시물 상세 페이지 공통 서버 컴포넌트
│   │   │   │   │   │   └── View.js               # 게시물 상세 페이지 공통 클라이언트 컴포넌트
│   │   │   │   │   ├── comment/[nickname]/page.tsx        # 특정 유저의 댓글이 있는 게시글 검색
│   │   │   │   │   ├── post/[nickname]/page.tsx           # 특정 유저가 작성간 게시글 검색
│   │   │   │   │   ├── search/[keyword]/page.tsx          # 키워드를 통한 검색
│   │   │   │   │   ├── popular                            # 인기 게시판
│   │   │   │   │   ├── board.tsx                     # 게시판 공통 클라이언트 컴포넌트
│   │   │   │   │   └── boardList.tsx                 # 게시판 공통 클라이언트 컴포넌트
│   │   │   │   ├── find/page.tsx      # 아이디/비밀번호 찾기
│   │   │   │   ├── login/page.tsx     # 로그인
│   │   │   │   ├── my/                # 마이페이지
│   │   │   │   │   ├── activity/      # 마이페이지 활동 목록
│   │   │   │   │   │   ├── comment/page.tsx            # 유저가 댓글을 작성한 게시물
│   │   │   │   │   │   ├── like-comment/page.tsx       # 유저가 좋아요를 누른 댓글이 있는 게시물
│   │   │   │   │   │   ├── like-post/page.tsx          # 유저가 좋아요를 누른 게시물
│   │   │   │   │   │   ├── post/page.tsx               # 유저가 작성한 게시물
│   │   │   │   │   │   └── myActivity.tsx              # 유저가 작성한 게시물
│   │   │   │   │   ├── blocked/page.tsx          # 차단 목록
│   │   │   │   │   ├── following/page.tsx        # 팔로우 및 팔로잉 목록
│   │   │   │   │   ├── menu-settings/page.tsx    # 사용자 맞춤 메뉴 세팅
│   │   │   │   │   ├── message/page.tsx          # 쪽지함
│   │   │   │   │   ├── notice/page.tsx           # 알림함
│   │   │   │   │   ├── myHeader.tsx              # 마이페이지 헤더
│   │   │   │   │   └── page.tsx                  # 유저 상세정보 수정 (마이페이지 메인)
│   │   │   │   ├── profile/                        # 유저 프로필
│   │   │   │   │   ├── [userNickname]/page.tsx     # 프로필 페이지 공통 서버 컴포넌트
│   │   │   │   │   ├── page.tsx                    # 프로필 페이지
│   │   │   │   │   └── profile.tsx                 # 프로필 공통 클라이언트 컴포넌트
│   │   │   │   ├── write                           # 게시물 작성 페이지
│   │   │   │   │   ├── [id]/page.tsx               # 게시물 수정 페이지
│   │   │   │   │   ├── page.tsx                    # 게시물 작성 클라이언트 컴포넌트
│   │   │   │   │   └── Editor.tsx                  # 게시물 작성 tiptap Editor
│   │   │   │   ├── privacy/page.tsx                # 개인정보처리방침
│   │   │   │   ├── terms/page.tsx                  # 이용약관
│   │   │   │   ├── Home.tsx                  # 메인 페이지
│   │   │   │   ├── layout.tsx                # 최상위 서버 컴포넌트
│   │   │   │   ├── layoutWrapper.tsx         # 레이아웃 분리를 위한 컴포넌트
│   │   │   │   └── page.tsx                  # 서버 컴포넌트
│   │   │   ├── admin/              # 관리자 페이지
│   │   │   │   ├── ad/             # 관리자 페이지 (추후 작업 예정)
│   │   │   │   ├── board/          # 게시물 관리 페이지
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── popup/
│   │   │   │   │   │   │   ├── boardConManagePopup.tsx          # 게시물 관리 팝업
│   │   │   │   │   │   │   ├── boardManagePopup.tsx             # 게시판 관리 팝업 (게시판 추가 기능)
│   │   │   │   │   │   │   ├── boardNoticePopup.tsx             # 공지 쓰기 팝업
│   │   │   │   │   │   │   └── boardNoticeViewPopup.tsx         # 공지 미리보기 팝업
│   │   │   │   │   │   ├── boardConManage.tsx                   # 게시글 컴포넌트
│   │   │   │   │   │   ├── boardManage.tsx                      # 게시판 컴포넌트
│   │   │   │   │   │   ├── boardNoticeManage.tsx                # 공지 컴포넌트
│   │   │   │   │   │   └── boardStorage.tsx                     # 보관함 컴포넌트
│   │   │   │   │   └── page.tsx     # 게시물 관련 페이지
│   │   │   │   ├── member/          # 회원 관리 페이지
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── popup/
│   │   │   │   │   │   │    └── RestrictionPopup/               # 회원 활동 제한 팝업
│   │   │   │   │   │   ├── MemberDetailModal.tsx                # 회원관리 상세 모달 컴포넌트
│   │   │   │   │   │   └── memberManage.tsx                     # 회원 관리 페이지 (회원 권한 관리)
│   │   │   │   │   └── page.tsx    # 회원 관련 페이지
│   │   │   │   ├── site/           # 사이트 관리 페이지
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── CommSignupTerm.tsx                   # 회원 가입 약관 관리
│   │   │   │   │   │   ├── commUsePolicy.tsx                    # 개인정보처리방침 관리
│   │   │   │   │   │   ├── commUseTerm.tsx                      # 이용약관 관리
│   │   │   │   │   │   └── SiteSettingsManage.tsx               # 사이트 관리
│   │   │   │   │   ├── adminEditor.tsx                          # 관리자 에디터
│   │   │   │   │   └── page.tsx                                 # 사이트 페이지
│   │   │   │   ├── admin.scss      # 관리자 스타일시트
│   │   │   │   ├── layout.tsx      # 관리자 서버 컴포넌트
│   │   │   │   └── page.tsx        # 관리자 메인
│   │   │   └── api/      # api
│   │   │       ├── admin/            # 관리자 api
│   │   │       │   ├── boards/        # 게시판
│   │   │       │   │   ├── move/route.ts               # 게시판 순서 변경 (유보)
│   │   │       │   │   └── route.ts
│   │   │       │   ├── community/     # 커뮤니티 관리
│   │   │       │   │   ├── logo/route.ts               # 로고 변경
│   │   │       │   │   ├── policy/route.ts             # 개인정보처리방침
│   │   │       │   │   ├── signup-terms/route.ts       # 회원가입약관
│   │   │       │   │   └── terms/route.ts              # 이용약관
│   │   │       │   ├── members/       # 회원 관리
│   │   │       │   │   ├── [id]/
│   │   │       │   │   │    ├── comments/route.ts      # 특정 유저 댓글
│   │   │       │   │   │    └── posts/route.ts         # 특정 유저 게시물
│   │   │       │   │   ├── authority/route.ts          # 권한 변경
│   │   │       │   │   ├── delete/route.ts             # 유저 탈퇴
│   │   │       │   │   ├── update-stats/route.ts       # 통계 (유보)
│   │   │       │   │   └── restriction/route.ts        # 이용 제한
│   │   │       │   └── posts/       # 게시물 관리
│   │   │       │       ├── archive/route.ts            # 게시물 보관함으로 이동
│   │   │       │       ├── delete/route.ts             # 게시물 삭제
│   │   │       │       ├── restore/route.ts            # 게시물 복원
│   │   │       │       └── route.ts                    # 게시물 확인
│   │   │       ├── auth/[...nextauth]/route.ts (next.js 권한 관리 - 미사용)
│   │   │       ├── authCheck/route.js      # 권한 체크
│   │   │       ├── board/      # 게시판
│   │   │       │   ├── [url_slug]/[page]/[limit]/route.js              # 게시판 조회
│   │   │       │   ├── popular/[page]/[limit]/route.js                 # 인기 게시판 조회
│   │   │       │   ├── search/[keyword]/[page]/[limit]/route.js        # 인기 게시판 조회
│   │   │       │   ├── stream/[url_slug]/route.js                      # 게시글 SSE (미사용)
│   │   │       │   ├── userComment/[nickname]/[page]/[limit]/route.js  # 특정 유저가 쓴 댓글이 있는 게시물 조회
│   │   │       │   ├── userPost/[nickname]/[page]/[limit]/route.js     # 특정 유저가 쓴 게시물 조회
│   │   │       │   └── route.js                                        # 게시판 조회
│   │   │       ├── boards/settings/route.js        # 게시물 인기도 조회
│   │   │       ├── comment/           # 댓글
│   │   │       │   ├── [id]/route.js               # 댓글 조회
│   │   │       │   ├── action/like/route.js        # 댓글 좋아요
│   │   │       │   └── upload/[fileName]/route.js  # 댓글 내 이미지 업로드
│   │   │       ├── find/route.js      # 회원 찾기
│   │   │       ├── home/              # 메인 페이지 게시판 ( 미사용 )
│   │   │       │   ├── popular/[page]/[limit]/route.js
│   │   │       │   └── route.js
│   │   │       ├── login/route.js     # 로그인
│   │   │       ├── logout/route.js    # 로그아웃
│   │   │       ├── member/
│   │   │       │   ├── withdrawal/route.js      # 회원 탈퇴
│   │   │       │   └── route.js                 # 회원 조회
│   │   │       ├── menu-custom/route.ts         # 사용자별 메뉴 커스텀
│   │   │       ├── message/
│   │   │       │   ├── report/route.js          # 회원 신고
│   │   │       │   └── send/route.js            # 쪽지 보내기
│   │   │       ├── my/
│   │   │       │   ├── [action]/[userId]/[page]/route.js          # 마이 페이지
│   │   │       │   └── bio/route.js                               # 자기소개
│   │   │       ├── notice/
│   │   │       │   ├── [id]/route.js            # 마이 페이지
│   │   │       │   └── route.js                 # 자기소개
│   │   │       ├── notifications/
│   │   │       │   ├── [id]/route.js            # 알림 조회
│   │   │       │   ├── unread-count/route.js    # 알림 확인 여부 체크
│   │   │       │   └── stream/route.js          # NOTIFY/LISTEN SSE 기능
│   │   │       ├── post/
│   │   │       │   ├── [url_slug]/[id]/route.js # 게시물 조회
│   │   │       │   ├── action/
│   │   │       │   │   ├── like/route.js        # 게시물 좋아요.
│   │   │       │   │   └── report/route.js      # 게시물 신고.
│   │   │       │   └── stream/route.js          # NOTIFY/LISTEN SSE 기능 (미사용)
│   │   │       ├── push/
│   │   │       │   ├── send/route.js            # 쪽지 보내기
│   │   │       │   ├── subscribe/route.js       # 알림 받기
│   │   │       │   └── unsubscribe/route.js     # 알림 취소
│   │   │       ├── site/
│   │   │       │   └── settings/route.js        # 사이트 셋팅
│   │   │       ├── token/route.js               # 토큰 체크
│   │   │       ├── upload/
│   │   │       │   ├── [fileName]/route.js      # 이미지 및 영상이 포함된 게시물
│   │   │       │   ├── image/route.js           # 이미지 업로드
│   │   │       │   └── video/route.ts           # 비디오 업로드
│   │   │       ├── user/
│   │   │       │   ├── block/route.js                # 유저 차단
│   │   │       │   ├── duplicate/route.js            # 회원가입시 중복 체크
│   │   │       │   ├── email/route.js                # 이메일 인증
│   │   │       │   ├── follow/route.js               # 유저 팔로우
│   │   │       │   ├── profile/                      # 프로필
│   │   │       │   │   ├── [userNickname]/route.js   # 유저 프로필 보기
│   │   │       │   │   └── route.js                  # (미사용)
│   │   │       │   ├── theme/route.js                # 다크모드 테마 설정
│   │   │       │   └── route.ts                      # 회원가입
│   │   │       ├── components/
│   │   │       │   ├── icons/Bars3BottomCenterIcon.tsx # svg 아이콘 (가운데 정렬)
│   │   │       │   ├── dropDownMenu.tsx                # 드롭 다운 메뉴
│   │   │       │   ├── footer.tsx                      # 푸터 컴포넌트
│   │   │       │   ├── formatDate.tsx                  # 날짜 생성
│   │   │       │   ├── header.tsx                      # 헤더 컴포넌트
│   │   │       │   ├── Logo.tsx                        # 로고
│   │   │       │   ├── menu.server.tsx                 # 메뉴 서버 컴포넌트
│   │   │       │   ├── menu.tsx                        # 메뉴 클라이언트 컴포넌트
│   │   │       │   ├── MenuProviderWrapper.tsx         # 메뉴 contextAPI
│   │   │       │   ├── message.tsx                     # 메시지 보내기 팝업
│   │   │       │   ├── NotificationList.tsx            # 알림 목록
│   │   │       │   ├── NotificationManager.tsx         # 알림 구독 관리
│   │   │       │   ├── pagination.tsx                  # 페이지네이션
│   │   │       │   ├── ProgressiveInfiniteScroll.tsx   # 인피니티 스크롤 (관리자)
│   │   │       │   ├── QueryComponents.tsx             # 인피니티 스크롤 (관리자)
│   │   │       │   ├── right_ad.tsx                    # 우측 광고 (유보)
│   │   │       │   ├── search.tsx                      # 상단 검색 박스
│   │   │       │   ├── TiptapEditor.tsx                # Tiptab 에디터
│   │   │       │   ├── tiptapViewer.tsx                # Tiptab 뷰어 전용
│   │   │       │   └── Toast.ts                        # 인피니티 스크롤 Toast grid (관리자)
│   │   │       ├── contexts/     # contextApi
│   │   │       │   ├── AuthContext.tsx     # 유저 정보
│   │   │       │   └── MenuContext.tsx     # 메뉴 구성
│   │   │       ├── db/           # db 연결
│   │   │       │   ├── db.js     # db 연결 정보
│   │   │       │   └── s3.js     # s3 연결 정보
│   │   │       ├── extensions/           # tiptab Editor extention
│   │   │       │   ├── CustomTextStyle.js     # 글자 스타일 변경
│   │   │       │   ├── linkUrl.js             # 링크
│   │   │       │   └── video.js               # 비디오 업로드
│   │   │       ├── font/GmarketSansTTF/           # gmarketSans 폰트
│   │   │       │   ├── GmarketSansTTFBold.ttf
│   │   │       │   ├── GmarketSansTTFMedium.ttf
│   │   │       │   └── GmarketSansTTFLight.ttf
│   │   │       ├── func/           # 기능 모음
│   │   │       │   ├── hook/       # hook
│   │   │       │   │   ├── useCommentResizeObserver.tsx     # 댓글 박스 높이 조절
│   │   │       │   │   ├── useDropDown.tsx                  # 드롭 다운 메뉴
│   │   │       │   │   ├── useInfiniteQuery.tsx             # 인피니티 스크롤 (관리자)
│   │   │       │   │   ├── useLoadRecaptcha.tsx             # google Recaptcha
│   │   │       │   │   ├── useLoginCheck.tsx                # 간이 로그인 체크
│   │   │       │   │   └── useMutations.tsx                 # 멤버 권한 변경
│   │   │       │   ├── inputActive.tsx                      # 인풋 박스 애니메이션
│   │   │       │   └── replaceBlobsWithS3Urls.tsx
│   │   │       ├── lib/           # 라이브러리
│   │   │       │   ├── authOptions.ts            # 권한 관리 (미사용)
│   │   │       │   ├── notification-service.js   # 알림 시스템 통합 서비스
│   │   │       │   ├── prisma.ts                 # prisma 공통
│   │   │       │   ├── pushNotifications.ts      # 웹푸시 알림
│   │   │       │   ├── serverTokenCheck.ts       # 서버에서 토큰 체크
│   │   │       │   └── sse.js                    # 권한 옵션 (미사용)
│   │   │       ├── style/           # 스타일
│   │   │       │   ├── fontello                  # 폰텔로
│   │   │       │   ├── base.css                  # 기본 스타일시트
│   │   │       │   ├── checkbox.scss             # 체크박스
│   │   │       │   ├── darkTheme.scss            # 다크모드 테마
│   │   │       │   ├── font.css                  # 폰트
│   │   │       │   ├── Login.module.scss         # 로그인 전용 스타일
│   │   │       │   ├── style.common.scss         # 일반 스타일
│   │   │       │   └── var.scss                  # 스타일 변수 모음
│   │   │       └── type/           # 타입스크립트 타입
│   │   │           ├── commentType.ts            # 댓글 타입
│   │   │           ├── next-auth.d.ts            # next 권한 관리 (미사용)
│   │   │           └── type.ts                   # 타입 모음
│   │   ├── lib/                 # 라이브러리
│   │   └── middleware.ts        # Next.js 미들웨어
│   ├── prisma/                  # 데이터베이스 스키마
│   │   ├── schema.prisma        # Prisma 스키마
│   │   ├── migrations/          # 마이그레이션 파일
│   │   └── seed.js              # 시드 데이터
│   ├── public/                  # 정적 파일
│   └── package.json
└── stream/                      # 스트리밍 서버 (별도)
```

## 🔌 핵심 API

### 인증 시스템 (`/api/`)

```http
POST /api/login              # 로그인 (reCAPTCHA 검증)
POST /api/member             # 회원가입 (이메일 인증)
POST /api/logout             # 로그아웃
GET  /api/authCheck          # JWT 토큰 검증
```

### 게시판 시스템 (`/api/board/`)

```http
GET  /api/board                           # 게시판 목록
GET  /api/board/[url_slug]               # 게시판별 게시물 목록
POST /api/board                          # 게시물 작성
PUT  /api/board/[id]                     # 게시물 수정
DELETE /api/board/[id]                   # 게시물 삭제
GET  /api/board/popular/[page]/[limit]   # 인기 게시물
```

### 댓글 시스템 (`/api/comment/`)

```http
GET  /api/comment/[postId]               # 댓글 목록
POST /api/comment                        # 댓글 작성
PUT  /api/comment/[id]                   # 댓글 수정
DELETE /api/comment/[id]                 # 댓글 삭제
POST /api/comment/action/like            # 좋아요/싫어요
```

### 사용자 관리 (`/api/user/`)

```http
GET  /api/user/profile/[nickname]        # 프로필 조회
PUT  /api/user/profile                   # 프로필 수정
POST /api/user/follow                    # 팔로우/언팔로우
GET  /api/user/blocked                   # 차단 목록
POST /api/user/block                     # 사용자 차단
```

### 알림 시스템 (`/api/notifications/`)

```http
GET  /api/notifications                  # 알림 목록
PATCH /api/notifications                 # 알림 읽음 처리
POST /api/push/subscribe                 # 푸시 알림 구독
POST /api/push/unsubscribe              # 푸시 알림 해제
```

### 파일 업로드 (`/api/upload/`)

```http
POST /api/upload/image                   # 이미지 업로드 (S3)
POST /api/upload/video                   # 동영상 업로드 (S3)
GET  /api/upload/presigned-url          # S3 Pre-signed URL 생성
```

### 관리자 API (`/api/admin/`)

```http
GET  /api/admin/members                  # 회원 관리
POST /api/admin/members/restriction      # 회원 제재
GET  /api/admin/posts                    # 게시물 관리
DELETE /api/admin/posts/delete           # 게시물 삭제
GET  /api/admin/boards                   # 게시판 관리
```

### 핵심 테이블 구조

#### 사용자 관련

- **`members`** - 사용자 정보, 통계, 보안 설정
- **`follows`** - 팔로우/팔로워 관계
- **`blocked_users`** - 차단 관계
- **`user_messages`** - 쪽지 시스템

#### 게시판 관련

- **`boards`** - 게시판 정보 및 설정
- **`posts`** - 게시물 (제목, 내용, 조회수, 좋아요 등)
- **`comments`** - 댓글 (무한 깊이 구조)
- **`post_actions`** - 게시물 액션 (좋아요, 싫어요)
- **`comment_actions`** - 댓글 액션

#### 시스템 관련

- **`notifications`** - 알림 데이터
- **`push_subscriptions`** - 웹 푸시 구독 정보
- **`user_reports`** - 신고 내역
- **`site_settings`** - 사이트 설정
- **`menu_custom`** - 사용자 정의 메뉴

## 🚀 배포

### 환경 구성

```bash
# 환경 변수는 각 플랫폼 변수 관리 탭에서 설정
```

### 배포 과정

#### 1. 코드 배포

```bash
# Git 푸시로 Vercel 자동 배포
git add .
git commit -m "Deploy update"
git push origin main
```

#### 2. 데이터베이스 마이그레이션

```bash
# Git 푸시로 Vercel 자동 배포 시 설정
# = prisma migrate deploy && prisma generate && next build
```

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run migrate && npm run generate && next build",
    "vercel-build": "prisma migrate deploy && prisma generate && npm run seed && next build",
    "migrate": "prisma migrate deploy",
    "generate": "prisma generate",
    "seed": "node prisma/seed.js"
  }
}
```

#### 3. SSE 서버 배포 (별도)

```bash
# Git 푸시로 render 자동 배포
git add .
git commit -m "Deploy update"
git push origin master
```

## 🛠 개발 가이드

### 새 기능 추가 시 체크리스트

#### 1. 데이터베이스 변경

- [ ] Prisma 스키마 업데이트
- [ ] 마이그레이션 생성: `npx prisma migrate dev`
- [ ] 타입 재생성: `npx prisma generate`

#### 2. API 개발

- [ ] `/src/app/api/` 하위에 라우트 생성
- [ ] 인증이 필요한 경우 JWT 검증 추가
- [ ] 에러 처리 및 상태 코드 설정
- [ ] TypeScript 타입 정의

#### 3. 프론트엔드 개발

- [ ] 컴포넌트 생성 (`/src/app/components/`)
- [ ] TanStack Query 훅 생성
- [ ] 타입 정의 (`/src/app/type/type.ts`)
- [ ] 스타일링 (`/src/app/style/`)

#### 4. 테스트

- [ ] 로컬 환경에서 기능 테스트
- [ ] 에러 케이스 확인

### 코딩 컨벤션

#### 파일 명명

- 컴포넌트: `PascalCase.tsx`
- API 라우트: `route.ts` (폴더 구조로 경로 구성)
- 타입: `camelCase`

### 성능 최적화

#### 1. 이미지 최적화

- Next.js Image 컴포넌트 사용
- CloudFront CDN 활용
- WebP 포맷 자동 변환

#### 2. 데이터베이스 최적화

- 적절한 인덱스 설정
- 페이지네이션 구현

#### 3. 캐싱 전략

- TanStack Query로 클라이언트 캐싱
- Next.js ISR로 SSR 캐싱

---

**개발환경**: Node.js 18+, PostgreSQL 14+, Redis 6+  
**프로덕션**: Vercel + Neon + Render + AWS

````

### 한국어 URL 지원

```javascript
// 한국어 유저네임 URL 인코딩/디코딩
const encodedUsername = encodeURIComponent(username);
const decodedUsername = decodeURIComponent(params.userNickname);
````

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### 사용자 관련

- **members** - 사용자 정보 (인증, 프로필, 통계)
- **follows** - 팔로우 관계
- **blocked_users** - 차단 관계
- **user_messages** - 사용자 간 메시지
- **user_reports** - 사용자 신고

#### 게시판 관련

- **boards** - 게시판 정보
- **posts** - 게시물
- **comments** - 댓글 (계층 구조)
- **post_actions** - 게시물 액션 (좋아요, 조회, 신고)
- **comment_actions** - 댓글 액션
- **post_images** - 게시물 이미지
- **reports** - 신고 상세 정보

#### 시스템 관련

- **notifications** - 알림
- **push_subscriptions** - 푸시 알림 구독
- **site_settings** - 사이트 설정
- **terms** - 약관
- **policy** - 정책
