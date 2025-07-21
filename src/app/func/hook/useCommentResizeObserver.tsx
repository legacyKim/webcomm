// 높이 자동 측정 Hook
import { useEffect } from "react";
import { CommentTreeNodeArr } from "@/type/commentType";

export function useCommentResizeObserver(
  refs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>,
  setHeights: (
    heights: { [key: number]: number } | ((prev: { [key: number]: number }) => { [key: number]: number }),
  ) => void,
  commentList: CommentTreeNodeArr | null,
) {
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const updatedHeights: { [key: number]: number } = {};
      entries.forEach((entry) => {
        const idAttr = entry.target.getAttribute("data-comment-id");
        if (idAttr) {
          const id = parseInt(idAttr);
          updatedHeights[id] = entry.contentRect.height;
        }
      });

      if (Object.keys(updatedHeights).length > 0) {
        setHeights((prev: { [key: number]: number }) => ({ ...prev, ...updatedHeights }));
      }
    });

    Object.entries(refs.current).forEach(([id, el]) => {
      if (el) {
        el.setAttribute("data-comment-id", id); // ID 저장
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [refs, setHeights, commentList]);
}
