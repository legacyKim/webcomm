"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBoardData } from "../api/api";
import { Posts } from "../type/type";

import Link from "next/link";

import { useDropDown } from "app/func/hook/useDropDown";
import DropDownMenu from "app/components/dropDownMenu";

export default function Boardlist({ url_slug }: { url_slug: string }) {
  // const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: postData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["eachBoardData", url_slug, page, limit],
    queryFn: () => fetchBoardData(url_slug, page, limit),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["eachBoardData", url_slug],
    });
  }, [url_slug]);

  useEffect(() => {
    let eventSource: EventSource | undefined;

    function connectSSE() {
      eventSource = new EventSource(`/api/board/stream/${url_slug}`);

      eventSource.onmessage = (event) => {
        const updatedData = JSON.parse(event.data);
        if (updatedData.slug === url_slug) {
          queryClient.invalidateQueries({ queryKey: ["eachBoardData", url_slug] });
        }
      };

      eventSource.onerror = () => {
        console.warn("SSE 연결 끊김. 5초 후 재연결...");
        if (eventSource) eventSource.close();
        setTimeout(connectSSE, 5000);
      };
    }

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [url_slug]);

  // writer dropdown
  const { writerDrop, dropPosition, handleWriterClick } = useDropDown();
  const [userInfoInDropMenu, setUserInfoInDropMenu] = useState({
    userId: "",
    userName: "",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  const totalPages = postData?.totalPages || 1;

  return (
    <>
      <ol className='board_list'>
        {writerDrop && (
          <DropDownMenu
            style={{
              top: `${dropPosition.top + 22}px`,
              left: `${dropPosition.left - 4}px`,
            }}
            userInfoInDropMenu={userInfoInDropMenu}
          />
        )}

        {!isLoading && postData?.posts.length > 0 ? (
          postData?.posts.map((b: Posts, i: number) => (
            <li key={`${b.url_slug}_${b.id}`}>
              <Link href={`/board/${url_slug}/${b.id}`}>
                <span className='num'>{b.post_number}</span>
                <span className='title'>{b.title}</span>
                <span
                  className='writer'
                  onClick={(e) => {
                    handleWriterClick(e);
                    setUserInfoInDropMenu({
                      userId: b.user_id,
                      userName: b.user_nickname,
                    });
                  }}>
                  {b.user_nickname}
                </span>
                <span className='like'>
                  <i></i>
                  {b.likes}
                </span>
                <span className='view'>
                  <i></i>
                  {b.views}
                </span>
                {/* <span className="comment"><i></i>33</span> */}
                <span className='date'>{new Date(b.created_at).toLocaleDateString()}</span>
              </Link>
            </li>
          ))
        ) : (
          <div className='nodata'>
            <span>게시물이 없습니다.</span>
          </div>
        )}
      </ol>

      <div className='pagination'>
        <button onClick={() => setPage(1)} disabled={page === 1}>
          맨처음으로
        </button>
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          이전
        </button>

        {[...Array(totalPages)]
          .map((_, index) => (
            <button key={index + 1} onClick={() => setPage(index + 1)} className={page === index + 1 ? "active" : ""}>
              {index + 1}
            </button>
          ))
          .slice(Math.max(0, page - 5), page + 5)}

        <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
          다음
        </button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>
          마지막으로
        </button>
      </div>
    </>
  );
}
