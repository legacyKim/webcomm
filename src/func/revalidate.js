/**
 * 캐시 무효화를 위한 공통 함수
 * Next.js ISR 캐시를 무효화하여 최신 데이터로 갱신
 */

/**
 * 단일 캐시 무효화
 * @param {string} tag - 무효화할 태그 (예: 'post-123')
 * @param {string} path - 무효화할 경로 (예: '/board/free/123')
 */
export const callRevalidate = async (tag, path) => {
  try {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "http://localhost:3000";
    const SECRET = process.env.REVALIDATE_SECRET || "local-dev-secret";

    const res = await fetch(`${SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": SECRET,
      },
      body: JSON.stringify({ tag, path }),
    });

    if (!res.ok) {
      console.error("revalidate failed:", res.status, await res.text());
      return false;
    } else {
      console.log("revalidate success:", { tag, path });
      return true;
    }
  } catch (error) {
    console.error("revalidate error:", error);
    return false;
  }
};

/**
 * 게시글 관련 캐시 무효화
 * @param {number} postId - 게시글 ID
 * @param {string} urlSlug - URL 슬러그
 * @param {string} action - 액션 타입 ('create', 'update', 'delete')
 */
export const revalidatePost = async (postId, urlSlug, action = "update") => {
  const results = [];

  // 1. 게시글 태그 무효화
  results.push(await callRevalidate(`post-${postId}`, null));

  // 2. 삭제가 아닌 경우에만 페이지 경로 무효화
  if (action !== "delete" && urlSlug) {
    results.push(await callRevalidate(null, `/board/${urlSlug}/${postId}`));
  }

  // 3. 게시글 목록 캐시도 무효화 (새 게시글, 삭제 등)
  if ((action === "create" || action === "delete") && urlSlug) {
    // 게시판 목록 페이지 경로 무효화
    results.push(await callRevalidate(null, `/board/${urlSlug}`));
    // 게시판 태그 무효화 (첫 페이지만)
    results.push(await callRevalidate(`board-${urlSlug}`, null));
    results.push(await callRevalidate(`board-${urlSlug}-page-1`, null));
  }

  // 모든 호출이 성공했는지 확인
  return results.every((result) => result === true);
};

/**
 * 댓글 관련 캐시 무효화
 * @param {number} postId - 게시글 ID
 * @param {string} urlSlug - URL 슬러그
 */
export const revalidateComment = async (postId, urlSlug) => {
  return await callRevalidate(
    `post-${postId}`,
    urlSlug ? `/board/${urlSlug}/${postId}` : null
  );
};

/**
 * 비동기 캐시 무효화 (응답 대기 없음)
 * @param {string} tag - 무효화할 태그
 * @param {string} path - 무효화할 경로
 */
export const callRevalidateAsync = (tag, path) => {
  // 응답을 기다리지 않고 백그라운드에서 실행
  callRevalidate(tag, path).catch((error) => {
    console.error("async revalidate error:", error);
  });
};
