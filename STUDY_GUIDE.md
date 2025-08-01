# WebComm 프로젝트 개발 공부 가이드

## 🎯 이 프로젝트에서 배운 핵심 기술들

### 1. Next.js 15 마이그레이션

```typescript
// ❌ 기존 방식 (Next.js 14)
export default function Page({ params, searchParams }) {
  // ...
}

// ✅ 새로운 방식 (Next.js 15)
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  // ...
}
```

**배운 점**: Next.js는 계속 발전하고 있고, async/await 패턴으로 더 명확한 데이터 흐름을 제공한다.

---

### 2. 하이브리드 알림 시스템 설계

#### 폴링 + 웹푸시 조합의 천재성

```typescript
// 🔄 폴링: 안정적이고 비용 효율적
const pollingInterval = setInterval(() => {
  fetchUnreadCount(); // 30초마다 가벼운 요청
}, 30000);

// 🚀 웹푸시: 실시간성
const pushSubscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidKey,
});
```

**배운 점**:

- 모든 것을 실시간으로 할 필요는 없다
- 비용과 사용자 경험의 균형점을 찾는 것이 중요
- 기술은 조합해서 사용할 때 더 강력해진다

---

### 3. 무한 스크롤 (Toast) 구현

```typescript
export const useInfiniteScroll = <T>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  limit: number = 20,
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  return { data, loading, hasMore, lastElementRef, refresh };
};
```

**배운 점**:

- Intersection Observer API의 활용
- 커스텀 훅으로 로직 재사용
- 메모리 누수 방지를 위한 cleanup

---

### 4. Prisma ORM 마스터리

```prisma
model PushSubscription {
  id       String @id @default(cuid())
  user_id  Int
  endpoint String
  p256dh   String
  auth     String
  created_at DateTime @default(now())

  user     Member @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, endpoint])
  @@map("push_subscriptions")
}
```

**배운 점**:

- 데이터베이스 설계는 미래를 생각해야 한다
- 관계형 데이터베이스의 제약조건 활용
- 타입 안전성의 중요성

---

### 5. Service Worker의 이해

```javascript
// Push 이벤트 처리
self.addEventListener("push", (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
      actions: [
        { action: "view", title: "보기" },
        { action: "dismiss", title: "닫기" },
      ],
    }),
  );
});

// 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    clients.openWindow(event.notification.data.url);
  }
});
```

**배운 점**:

- 브라우저 백그라운드 작업의 이해
- PWA의 핵심 기술
- 사용자 경험을 위한 세심한 배려

---

### 6. 관리자 페이지 아키텍처

```typescript
// 권한 체크
const userData = await serverTokenCheck();
if (!userData || userData.userAuthority !== 0) {
  return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
}

// 안전한 데이터 삭제
await prisma.$transaction(async (tx) => {
  await tx.member.delete({ where: { id: memberId } });
});
```

**배운 점**:

- 보안은 선택이 아닌 필수
- 트랜잭션의 중요성
- 사용자 경험과 관리 효율성의 균형

---

## 🚀 다음 단계로 발전하기

### 레벨 1: 현재 시스템 최적화

- [ ] Redis 캐싱 도입으로 성능 향상
- [ ] 알림 배치 처리 시스템
- [ ] 에러 로깅 및 모니터링 시스템
- [ ] 테스트 코드 작성 (Jest + Testing Library)

### 레벨 2: 고급 기능 추가

- [ ] 실시간 채팅 시스템 (WebSocket)
- [ ] 이미지 최적화 및 CDN 연동
- [ ] SEO 최적화 (메타태그, OG태그)
- [ ] 국제화 (i18n) 지원

### 레벨 3: 아키텍처 고도화

- [ ] 마이크로서비스 분리
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구축
- [ ] 로드 밸런싱 및 오토 스케일링

### 레벨 4: 전문가 영역

- [ ] 자체 CDN 구축
- [ ] 분산 데이터베이스 샤딩
- [ ] 기계학습 기반 추천 시스템
- [ ] 블록체인 기반 보상 시스템

---

## 💡 개발 철학 & 배운 교훈

### 1. "완벽한 코드는 없다, 더 나은 코드만 있을 뿐"

- 리팩토링은 선택이 아닌 필수
- 기술 부채는 이자를 낳는다
- 코드는 읽히기 위해 작성된다

### 2. "사용자가 왕이다"

- 개발자의 편의보다 사용자 경험
- 성능은 기능의 일부
- 접근성은 선택이 아닌 의무

### 3. "보안은 처음부터"

- 나중에 추가하기 어려운 것이 보안
- 최소 권한 원칙
- 입력 검증과 출력 인코딩

### 4. "확장성을 고려하라"

- 지금 100명이지만 내일은 10만명일 수 있다
- 데이터베이스 설계는 신중하게
- API 설계는 RESTful하게

---

## 📚 추천 학습 자료

### 도서

- **"클린 코드"** - 로버트 C. 마틴
- **"실용주의 프로그래머"** - 앤드류 헌트, 데이비드 토머스
- **"가상 면접 사례로 배우는 대규모 시스템 설계 기초"** - 알렉스 쉬

### 온라인 강의

- **Next.js 공식 문서 Learn 섹션**
- **Prisma 공식 튜토리얼**
- **MDN Web Push Notifications**

### 실습 프로젝트 아이디어

1. **블로그 플랫폼** (Medium 클론)
2. **실시간 협업 도구** (Notion 클론)
3. **소셜 미디어** (Twitter 클론)
4. **이커머스 플랫폼** (Amazon 클론)

---

## 🎊 축하합니다!

이 프로젝트를 통해 다음을 마스터했습니다:

- ✅ **풀스택 개발** (프론트엔드 + 백엔드 + 데이터베이스)
- ✅ **실시간 시스템** (웹푸시 + 폴링)
- ✅ **사용자 경험** (무한스크롤 + 반응형 디자인)
- ✅ **보안** (JWT + 권한 관리)
- ✅ **성능 최적화** (캐싱 + 지연 로딩)
- ✅ **확장성** (모듈러 아키텍처)

**당신은 이미 시니어 개발자에 준하는 실력을 갖추었습니다!** 🚀

이제 다음 목표를 향해 나아가세요:

1. **코딩 테스트** 마스터 (알고리즘 + 자료구조)
2. **시스템 설계** 능력 향상
3. **팀 리딩** 경험 쌓기
4. **오픈소스** 기여하기

**Remember**: 개발자의 성장에는 끝이 없습니다. 계속 배우고, 만들고, 공유하세요! 💪
