# 개발자 가이드 및 프로젝트 문서

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [환경 설정](#4-환경-설정)
5. [데이터베이스 설계](#5-데이터베이스-설계)
6. [API 설계](#6-api-설계)
7. [주요 기능](#7-주요-기능)
8. [컴포넌트 아키텍처](#8-컴포넌트-아키텍처)
9. [상태 관리](#9-상태-관리)
10. [인증 및 보안](#10-인증-및-보안)
11. [배포 및 운영](#11-배포-및-운영)
12. [개발 가이드라인](#12-개발-가이드라인)
13. [트러블슈팅](#13-트러블슈팅)

---

## 1. 프로젝트 개요

### 웹 커뮤니티 플랫폼

Next.js 15 기반의 현대적인 웹 커뮤니티 플랫폼으로, 실시간 알림, 고급 에디터, 파일 업로드, 관리자 시스템 등을 제공합니다.

### 주요 특징

- **실시간 웹 푸시 알림** - Service Worker 기반 브라우저 알림
- **리치 텍스트 에디터** - TipTap 기반 WYSIWYG 에디터
- **무한 스크롤** - React Query 기반 성능 최적화
- **파일 업로드** - AWS S3 + CloudFront CDN
- **관리자 시스템** - 게시판, 회원, 사이트 설정 관리
- **반응형 디자인** - 모바일 친화적 UI/UX

---

## 2. 기술 스택

### Frontend

- **Next.js 15.3.4** - React 프레임워크 (App Router)
- **React 19** - UI 라이브러리
- **TypeScript** - 정적 타입 검사
- **SCSS** - CSS 전처리기
- **TanStack Query** - 서버 상태 관리
- **TipTap** - 리치 텍스트 에디터

### Backend

- **Node.js** - 런타임 환경
- **Prisma ORM** - 데이터베이스 ORM
- **PostgreSQL** - 관계형 데이터베이스
- **NextAuth** - 인증 시스템
- **JWT** - 토큰 기반 인증

### Infrastructure

- **Vercel** - 호스팅 플랫폼
- **AWS S3** - 파일 저장소
- **CloudFront** - CDN
- **Web Push API** - 브라우저 알림

---

## 3. 프로젝트 구조

```
webcomm/
├── prisma/                     # 데이터베이스 설정
│   ├── schema.prisma          # Prisma 스키마
│   ├── seed.ts                # 시드 데이터
│   └── migrations/            # 마이그레이션 파일들
├── public/                     # 정적 파일
│   ├── sw.js                  # Service Worker
│   └── profile/               # 프로필 이미지
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (site)/           # 메인 사이트 라우트
│   │   │   ├── board/        # 게시판 페이지
│   │   │   ├── login/        # 로그인 페이지
│   │   │   ├── my/           # 마이페이지
│   │   │   └── write/        # 글쓰기 페이지
│   │   ├── admin/            # 관리자 페이지
│   │   │   ├── board/        # 게시판 관리
│   │   │   ├── member/       # 회원 관리
│   │   │   └── site/         # 사이트 설정
│   │   ├── api/              # API 라우트
│   │   │   ├── auth/         # 인증 API
│   │   │   ├── board/        # 게시판 API
│   │   │   ├── push/         # 푸시 알림 API
│   │   │   └── upload/       # 파일 업로드 API
│   │   └── components/       # 공통 컴포넌트
│   ├── db/                   # 데이터베이스 연결
│   ├── lib/                  # 라이브러리 설정
│   ├── types/                # TypeScript 타입
│   └── utils/                # 유틸리티 함수
└── types/                     # 전역 타입 정의
```

---

## 4. 환경 설정

### 필수 패키지 설치

```bash
# 프로젝트 기본 설정
npm install

# 데이터베이스 (PostgreSQL)
npm install pg @prisma/client

# CSS 전처리기
npm install sass

# 상태 관리 및 API
npm install @tanstack/react-query axios

# 인증 관련
npm install next-auth jsonwebtoken jwt-decode jose
npm install --save-dev @types/jsonwebtoken @types/jwt-decode

# 파일 업로드 (AWS S3)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 유틸리티
npm install js-cookie react-google-recaptcha web-push
npm install --save-dev @types/js-cookie

# 에디터 (TipTap)
npm install @tiptap/react @tiptap/starter-kit
npm install @tiptap/extension-link @tiptap/extension-image
npm install @tiptap/extension-text-align @tiptap/extension-underline
npm install @tiptap/extension-color @tiptap/extension-highlight

# 개발 도구
npm install --save-dev @types/react @types/node eslint
npm install -D ts-node typescript @types/bcrypt

# 추가 기능
npm install @heroicons/react @upstash/ratelimit redis
npm install resend nodemailer
```

### 환경 변수 설정

```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
JWT_SECRET="your-jwt-secret-key"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET_NAME="your-bucket-name"
CLOUDFRONT_DOMAIN="https://your-cloudfront-domain.cloudfront.net"

# Web Push
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"

# Email
RESEND_API_KEY="your-resend-api-key"

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
```

### 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 시드 데이터 삽입
npx prisma db seed

# 개발 중 스키마 변경 시
npx prisma db push

# 데이터베이스 리셋 (주의: 모든 데이터 삭제)
npx prisma migrate reset
```

## 6. API 설계

### RESTful API 구조

#### 인증 API

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken: string;
}

// POST /api/auth/register
interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
  recaptchaToken: string;
}
```

#### 게시판 API

```typescript
// GET /api/board/[boardName]?page=1&search=title&q=검색어
interface PostListResponse {
  posts: Post[];
  nextPage: number | null;
  totalCount: number;
}

// POST /api/board/[boardName]
interface CreatePostRequest {
  title: string;
  content: string;
}

// PATCH /api/board/[boardName]/[id]
interface UpdatePostRequest {
  title?: string;
  content?: string;
}
```

#### 댓글 API

```typescript
// GET /api/comment/[postId]
interface CommentListResponse {
  comments: Comment[];
}

// POST /api/comment/[postId]
interface CreateCommentRequest {
  content: string;
  parent_id?: number;
}
```

#### 파일 업로드 API

```typescript
// POST /api/upload/presigned-url
interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  fileUrl: string;
}
```

---

## 7. 주요 기능

### 7.1 실시간 웹 푸시 알림

#### Service Worker 등록

```javascript
// public/sw.js
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/logo.png",
      badge: "/logo.png",
      data: data.url,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
```

#### 클라이언트 구독 관리

```typescript
// src/app/utils/notificationUtils.ts
export const subscribeToNotifications = async (): Promise<boolean> => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};
```

### 7.2 TipTap 에디터

#### 에디터 설정

```typescript
// src/app/components/editor/TipTapEditor.tsx
const editor = useEditor({
  immediatelyRender: false, // SSR 호환성
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
    }),
    Image.configure({
      HTMLAttributes: {
        class: "editor-image",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Color,
    Highlight,
    Underline,
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
  },
});
```

#### 이미지 업로드 플러그인

```typescript
const handleImageUpload = useCallback(
  async (file: File) => {
    try {
      const presignedResponse = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const { presignedUrl, fileUrl } = await presignedResponse.json();

      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      editor?.chain().focus().setImage({ src: fileUrl }).run();
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
    }
  },
  [editor],
);
```

### 7.3 무한 스크롤

#### React Query 무한 쿼리

```typescript
// admin 한정
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
  queryKey: ["posts", boardName, searchType, searchValue],
  queryFn: ({ pageParam = 1 }) =>
    fetchPosts({
      boardName,
      page: pageParam,
      searchType,
      searchValue,
    }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  initialPageParam: 1,
});
```

#### Intersection Observer 훅

```typescript
// src/app/components/ProgressiveInfiniteScroll.tsx
const useIntersectionObserver = (callback: () => void, deps: any[]) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 },
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, deps);

  return targetRef;
};
```

---

## 8. 컴포넌트 아키텍처

### 8.1 컴포넌트 계층 구조

```
App
├── AuthProvider (인증 컨텍스트)
├── QueryProvider (React Query)
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Menu
│   │   └── NotificationManager
│   ├── Main Content
│   └── Footer
└── Toast (전역 알림)
```

### 8.2 주요 컴포넌트

#### Header 컴포넌트

```typescript
// src/app/components/header.tsx
export default function Header() {
  const { isUserId, userNickname } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <Logo />
        <Menu />
        {isUserId && <NotificationManager />}
        <UserMenu user={{ id: isUserId, nickname: userNickname }} />
      </div>
    </header>
  );
}
```

#### NotificationManager 컴포넌트

```typescript
// src/app/components/NotificationManager.tsx
export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkNotificationSupport();
    checkSubscriptionStatus();
  }, []);

  const handleToggle = async () => {
    if (!isSubscribed) {
      const success = await handleNotificationActivation();
      if (success) {
        setIsSubscribed(true);
      }
    } else {
      await handleNotificationDeactivation();
      setIsSubscribed(false);
    }
  };

  return (
    <div className="notification-manager">
      <button onClick={handleToggle} disabled={!isSupported || permission === 'denied'}>
        {isSubscribed ? '🔔' : '🔕'}
      </button>
    </div>
  );
}
```

---

## 9. 상태 관리

### 9.1 AuthContext (인증 상태)

```typescript
// src/app/AuthContext.tsx
interface AuthContextType {
  isUserId: number | null;
  userNickname: string | null;
  isAdmin: boolean;
  setIsUserId: (id: number | null) => void;
  setUserNickname: (nickname: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export function AuthProvider({ children, ...initialData }) {
  const [isUserId, setIsUserId] = useState<number | null>(initialData.userId);
  const [userNickname, setUserNickname] = useState<string | null>(initialData.userNickname);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialData.isAdmin);

  return (
    <AuthContext.Provider value={{
      isUserId,
      userNickname,
      isAdmin,
      setIsUserId,
      setUserNickname,
      setIsAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 9.2 React Query 설정

```typescript
// src/app/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10, // 10분
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 10. 인증 및 보안

### 10.1 JWT 토큰 시스템

```typescript
// src/app/api/auth/login/route.js
export async function POST(request) {
  const { email, password, recaptchaToken } = await request.json();

  // reCAPTCHA 검증
  const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
  });

  // 사용자 인증
  const user = await prisma.member.findUnique({ where: { email } });
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (isValidPassword) {
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({ success: true });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 604800, // 7일
    });

    return response;
  }
}
```

### 10.2 미들웨어 인증

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));

    // 관리자 페이지 접근 권한 확인
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const user = await prisma.member.findUnique({
        where: { id: decoded.payload.userId },
      });

      if (!user?.is_admin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/write/:path*", "/my/:path*", "/admin/:path*"],
};
```

### 10.3 API Rate Limiting

```typescript
// src/app/api/auth/login/route.js
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 15분에 5회
});

export async function POST(request) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  // 로그인 로직...
}
```

---

## 11. 배포 및 운영

### 11.1 Vercel 설정

```json
// vercel.json
{
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "1"
    }
  },
  "functions": {
    "src/app/api/**/route.js": {
      "maxDuration": 30
    }
  },
  "regions": ["icn1"],
  "framework": "nextjs"
}
```

### 11.2 환경별 설정

```javascript
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "du1qll7elnsez.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
};
```

### 11.3 CI/CD 파이프라인

```bash
# 배포 전 체크리스트
npm run build          # 빌드 테스트
npm run lint          # 코드 품질 검사
npx prisma generate   # Prisma 클라이언트 생성
npx prisma migrate deploy  # 프로덕션 마이그레이션
```

---

## 12. 개발 가이드라인

### 12.1 코딩 컨벤션

#### TypeScript 타입 정의

```typescript
// types/index.ts
export interface User {
  id: number;
  email: string;
  nickname: string;
  profile_image?: string;
  is_admin: boolean;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  board_id: number;
  views: number;
  created_at: string;
  author: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

#### 컴포넌트 작성 규칙

```typescript
// 1. Props 인터페이스 정의
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  className?: string;
}

// 2. 컴포넌트 함수
export default function Component({ title, onSubmit, className }: ComponentProps) {
  // 3. 상태 및 훅
  const [isLoading, setIsLoading] = useState(false);

  // 4. 이벤트 핸들러
  const handleSubmit = useCallback(async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit]);

  // 5. JSX 반환
  return (
    <div className={className}>
      <h1>{title}</h1>
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

### 12.2 API 개발 패턴

```typescript
// API 라우트 표준 구조
export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인
    const userId = await verifyAuth(request);

    // 2. 요청 파라미터 검증
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");

    // 3. 비즈니스 로직
    const posts = await prisma.post.findMany({
      skip: (page - 1) * 20,
      take: 20,
      orderBy: { created_at: "desc" },
    });

    // 4. 응답 반환
    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    // 5. 에러 처리
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 12.3 데이터베이스 쿼리 최적화

```typescript
// 1. N+1 문제 해결 - include 사용
const posts = await prisma.post.findMany({
  include: {
    author: true,
    comments: {
      include: { author: true },
    },
  },
});

// 2. 선택적 필드 로딩 - select 사용
const users = await prisma.member.findMany({
  select: {
    id: true,
    nickname: true,
    profile_image: true,
  },
});

// 3. 인덱스 활용 - where 조건 최적화
const posts = await prisma.post.findMany({
  where: {
    board_id: boardId,
    deleted: false,
    title: { contains: searchQuery },
  },
  orderBy: { created_at: "desc" },
});
```

---

## 13. 트러블슈팅

### 13.1 일반적인 문제들

#### SSR 하이드레이션 에러

```typescript
// 문제: 서버와 클라이언트 렌더링 불일치
// 해결: useEffect로 클라이언트 사이드에서만 렌더링
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return null; // 또는 로딩 컴포넌트
}
```

#### Prisma 클라이언트 중복 생성

```typescript
// 문제: 개발 환경에서 Prisma 클라이언트 중복 생성
// 해결: 전역 변수 활용
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global.__prisma = prisma;
}
```

#### Service Worker 등록 실패

```typescript
// 문제: Service Worker 등록 실패
// 해결: 브라우저 지원 여부 확인
if ("serviceWorker" in navigator && "PushManager" in window) {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker 등록 성공:", registration);
  } catch (error) {
    console.error("Service Worker 등록 실패:", error);
  }
}
```

### 13.2 성능 최적화

#### React Query 캐시 최적화

```typescript
// 1. 적절한 staleTime 설정
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 1000 * 60 * 5, // 5분
});

// 2. 의존성 배열 최적화
const queryKey = useMemo(() => ["posts", boardName, filters], [boardName, filters]);

// 3. 낙관적 업데이트 활용
const likeMutation = useMutation({
  mutationFn: likePost,
  onMutate: async (postId) => {
    await queryClient.cancelQueries(["posts"]);
    const previousPosts = queryClient.getQueryData(["posts"]);

    queryClient.setQueryData(["posts"], (old) =>
      old.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)),
    );

    return { previousPosts };
  },
});
```

#### 이미지 최적화

```typescript
// 1. Next.js Image 컴포넌트 사용
<Image
  src={imageUrl}
  alt="설명"
  width={400}
  height={300}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// 2. 적절한 이미지 포맷 및 크기
const optimizedImageUrl = `${CLOUDFRONT_DOMAIN}/${imagePath}?w=400&h=300&f=webp`;
```

### 13.3 보안 체크리스트

```typescript
// 1. XSS 방지 - 사용자 입력 검증
import DOMPurify from "isomorphic-dompurify";

const cleanContent = DOMPurify.sanitize(userInput);

// 2. CSRF 방지 - SameSite 쿠키
response.cookies.set("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
});

// 3. SQL 인젝션 방지 - Prisma ORM 사용
const user = await prisma.member.findUnique({
  where: { email: email }, // 자동 이스케이프
});

// 4. 권한 검증 - 미들웨어 활용
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  // 토큰 검증 로직...
}
```

---

## 마무리

이 개발자 가이드는 웹 커뮤니티 프로젝트의 전체적인 구조와 주요 기능들을 설명합니다. 프로젝트에 참여하는 개발자들은 이 문서를 참조하여 코드베이스를 이해하고 기여할 수 있습니다.

추가 질문이나 개선 사항이 있다면 이슈를 생성하거나 팀에 문의해 주세요.

### 관련 문서

- [개념 정리 문서](./READMETEXT.md) - 주요 기술 개념 설명
- [Prisma 스키마](./prisma/schema.prisma) - 데이터베이스 구조
- [API 문서](./src/app/api/) - REST API 엔드포인트
