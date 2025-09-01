/**
 * 제목을 URL-friendly한 슬러그로 변환
 * 블라인드처럼 하이픈으로 구분된 형태로 생성
 */
export function createTitleSlug(title: string, id: number): string {
  if (!title) return `post-${id}`;

  return (
    title
      .toLowerCase()
      .trim()
      // 한글, 영문, 숫자만 유지하고 나머지는 공백으로 변환
      .replace(/[^\w\s가-힣]/g, " ")
      // 연속된 공백을 하나로 합치기
      .replace(/\s+/g, " ")
      .trim()
      // 공백을 하이픈으로 변환
      .replace(/\s/g, "-")
      // 연속된 하이픈 제거
      .replace(/-+/g, "-")
      // 앞뒤 하이픈 제거
      .replace(/^-|-$/g, "")
      // 50자 제한
      .slice(0, 50)
      // 끝에 ID 추가 (고유성 보장)
      .replace(/-$/, "") + `-${id}`
  );
}

/**
 * 슬러그에서 ID 추출
 */
export function extractIdFromSlug(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * 슬러그가 숫자인지 확인 (기존 ID 기반 URL 체크용)
 */
export function isNumericId(slug: string): boolean {
  return /^\d+$/.test(slug);
}

/**
 * 정규화된 게시글 URL 생성
 */
export function createCanonicalPostUrl(
  urlSlug: string,
  title: string,
  id: number
): string {
  const titleSlug = createTitleSlug(title, id);
  return `/board/${urlSlug}/${titleSlug}`;
}
