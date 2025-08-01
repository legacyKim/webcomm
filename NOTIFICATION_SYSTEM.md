# 웹푸시 + 폴링 하이브리드 알림 시스템

이 시스템은 커뮤니티 사이트에 최적화된 비용 효율적인 알림 시스템입니다.

## 시스템 구조

### 1. 폴링 (Polling)

- **용도**: 일반적인 알림 수 확인 및 정기적 업데이트
- **주기**: 30초마다 읽지 않은 알림 수 확인, 5분마다 전체 알림 리스트 새로고침
- **장점**: 안정적이고 서버 부하가 적음
- **비용**: 무료

### 2. 웹푸시 (Web Push)

- **용도**: 실시간 알림 (댓글, 대댓글, 좋아요, 쪽지, 멘션)
- **장점**: 즉시 전달, 사용자 경험 향상
- **비용**: 무료 (FCM, Mozilla의 Push Service 등 이용)

## 구현된 기능

### API 엔드포인트

- `GET /api/notifications` - 알림 목록 조회
- `PATCH /api/notifications` - 알림 읽음 처리
- `POST /api/notifications` - 새 알림 생성 및 웹푸시 발송
- `GET /api/notifications/unread-count` - 읽지 않은 알림 수 조회
- `POST /api/push/subscribe` - 웹푸시 구독 등록
- `POST /api/push/unsubscribe` - 웹푸시 구독 해제
- `POST /api/push/send` - 웹푸시 알림 발송

### 데이터베이스 모델

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

### 프론트엔드 컴포넌트

- `NotificationManager` - 웹푸시 구독 관리
- `NotificationList` - 알림 목록 표시
- `header.tsx` - 헤더의 알림 뱃지 및 드롭다운

### Service Worker

- `public/sw.js` - 웹푸시 수신 및 처리

## 사용법

### 1. 환경변수 설정

```env
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 2. 웹푸시 구독

사용자가 알림 페이지(`/my/notice`)에서 "푸시 알림 허용" 버튼을 클릭하여 구독할 수 있습니다.

### 3. 알림 발송

새로운 댓글, 대댓글, 좋아요 등이 발생할 때 자동으로 웹푸시 알림이 발송됩니다.

```javascript
// 예시: 댓글 작성 시 알림 발송
const response = await fetch("/api/notifications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    receiver_id: postAuthorId,
    sender_id: commentAuthorId,
    type: "comment",
    post_id: postId,
    content: "새 댓글이 작성되었습니다.",
  }),
});
```

## 비용 최적화 전략

1. **폴링 주기 조정**: 사용자가 활성화된 상태에서만 폴링 실행
2. **웹푸시 배치 처리**: 동일한 사용자에게 여러 알림이 있을 때 묶어서 발송
3. **만료된 구독 정리**: 410 에러 발생 시 자동으로 구독 삭제
4. **알림 중복 방지**: 같은 유형의 알림은 일정 시간 내 중복 발송 방지

## 브라우저 지원

- Chrome: 42+
- Firefox: 44+
- Safari: 16+ (macOS 13+, iOS 16.4+)
- Edge: 17+

## 보안 고려사항

1. **VAPID 개인 키 보호**: 서버에서만 사용, 절대 클라이언트에 노출 금지
2. **사용자 인증**: 모든 알림 API에서 사용자 인증 확인
3. **구독 검증**: 구독 등록 시 사용자 소유권 확인
4. **Rate Limiting**: 알림 발송 빈도 제한

## 모니터링

- 웹푸시 발송 성공/실패율 추적
- 만료된 구독 수 모니터링
- 폴링 요청 빈도 분석
- 사용자 알림 읽음율 추적

이 시스템은 커뮤니티 사이트의 특성에 맞게 설계되어 실시간성과 비용 효율성을 모두 달성할 수 있습니다.
