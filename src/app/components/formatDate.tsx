export default function formatPostDate(isoString: string): string {
  const date = new Date(isoString);

  // 안전한 날짜 포맷팅 (하이드레이션 이슈 없음)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // 클라이언트에서만 실시간 비교가 필요한 경우
  if (typeof window !== "undefined") {
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    const isSameYear = date.getFullYear() === now.getFullYear();

    if (isSameYear) {
      return `${month}.${day}`;
    }
  }

  // 서버사이드와 클라이언트 모두에서 안전한 기본 포맷
  return `${year}.${month}.${day}`;
}
