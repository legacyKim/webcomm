"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBoardData, fetchUserPostData, fetchUserCommentData, fetchSearchData, fetchBoardPop } from "@/api/api";
import { Posts } from "@/type/type";
import { useAuth } from "@/AuthContext";

import Link from "next/link";

import { useDropDown } from "@/func/hook/useDropDown";
import DropDownMenu from "@/components/dropDownMenu";
import formatPostDate from "@/components/formatDate";
import Pagination from "@/components/pagination";

import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
  CalendarIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { NoSymbolIcon } from "@heroicons/react/24/solid";

import { SSE_BASE_URL } from "@/lib/sse";

interface BoardlistProps {
  url_slug: string | null;
  page: number;
  boardType: string;
  limit: number;
  initData?: any;
}

export default function Boardlist({ url_slug, page, boardType, limit, initData }: BoardlistProps) {
  const { isUserId, messageToUser } = useAuth();
  const [postData, setPostData] = useState<any>(initData || { posts: [] });

  useEffect(() => {
    // CSR: 2페이지 이상일 때만 실행
    if (page !== 1) {
      const fetchData = async () => {
        try {
          let data;
          if (boardType === "popular") data = await fetchBoardPop(page, 10, isUserId);
          else if (boardType === "userPost") data = await fetchUserPostData(url_slug, page, 10);
          else if (boardType === "userComment") data = await fetchUserCommentData(url_slug, page, 10);
          else if (boardType === "search") data = await fetchSearchData(url_slug, page, 10, isUserId);
          else if (boardType === "board") data = await fetchBoardData(url_slug, page, 10, isUserId);
          setPostData(data);
        } catch (err) {
          console.error("CSR fetch error:", err);
        }
      };

      fetchData();
    } else {
      setPostData(initData);
    }
  }, [url_slug, page, boardType, isUserId]);

  useEffect(() => {
    let eventSource: EventSource | undefined;

    function connectSSE() {
      eventSource = new EventSource(`${SSE_BASE_URL}/events/${url_slug}`);

      // eventSource.onmessage = (event) => {
      //   const updatedData = JSON.parse(event.data);
      //   if (updatedData.slug === url_slug) {
      //     queryClient.invalidateQueries({ queryKey: ["eachBoardData", url_slug] });
      //   }
      // };

      // eventSource.onerror = () => {
      //   console.warn("SSE 연결 끊김. 5초 후 재연결...");
      //   if (eventSource) eventSource.close();
      //   setTimeout(connectSSE, 5000);
      // };

      eventSource.onmessage = (event) => {
        const newPost = JSON.parse(event.data);
        setPostData((prev: typeof postData) => [newPost, ...prev]);
      };

      return () => {
        if (eventSource) eventSource.close();
      };
    }

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [url_slug]);

  // writer dropdown
  const writerRef = useRef<HTMLDivElement>(null);
  const { writerDrop, dropPosition, userClick } = useDropDown({ messageToUser });
  const [userInfoInDropMenu, setUserInfoInDropMenu] = useState<{
    userId: number;
    userNickname: string;
  }>({
    userId: 0,
    userNickname: "",
  });

  // if (isLoading)
  //   return (
  //     <div className='data_wait'>
  //       <span>잠시만 기다려 주세요.</span>
  //       <div className='dots'>
  //         <span className='dot dot1'>.</span>
  //         <span className='dot dot2'>.</span>
  //         <span className='dot dot3'>.</span>
  //       </div>
  //     </div>
  //   );

  const totalPage = postData?.totalPages || 1;

  return (
    <>
      <ol className='board_list'>
        {isUserId && isUserId !== userInfoInDropMenu.userId && writerDrop && (
          <DropDownMenu
            style={{
              top: `${dropPosition.top + (writerRef.current?.offsetHeight ?? 0)}px`,
              left: `${dropPosition.left}px`,
            }}
            userInfoInDropMenu={userInfoInDropMenu}
          />
        )}
        <li className='board_list_header'>
          {boardType === "popular" ? <span className='category'></span> : <span className='num'></span>}
          <span className='title'></span>
          <div className='comment'>
            <ChatBubbleLeftEllipsisIcon className='icon' />
          </div>
          <div className='writer'></div>
          <div className='like'>
            <HeartIcon className='icon' />
          </div>
          <div className='view'>
            <EyeIcon className='icon' />
          </div>
          <div className='date'>
            <CalendarIcon className='icon' />
          </div>
        </li>
        {postData?.posts.length > 0 ? (
          postData?.posts.map((b: Posts) => (
            <li key={`${b.url_slug}_${b.id}`}>
              <Link href={`/board/${boardType === "popular" ? b.url_slug : url_slug}/${b.id}`}>
                {boardType !== "popular" &&
                  (b.notice ? (
                    <SpeakerWaveIcon className='icon notice' />
                  ) : (
                    <span className='num'>{b.post_number}</span>
                  ))}
                <span className='title'>
                  {boardType === "popular" && <span className='category'>{b.board_name}</span>}
                  {b.title}
                </span>
                <div className='comment'>
                  <i></i>
                  {b.comments}
                </div>
                <span
                  className='writer'
                  ref={writerRef}
                  onClick={async (e) => {
                    userClick(e);
                    setUserInfoInDropMenu({
                      userId: Number(b.user_id),
                      userNickname: b.user_nickname,
                    });
                  }}>
                  {b.user_nickname}
                </span>
                <div className='like'>
                  <i></i>
                  {b.likes}
                </div>
                <div className='view'>
                  <i></i>
                  {b.views}
                </div>
                {/* <span className="comment"><i></i>33</span> */}
                <div className='date'>{formatPostDate(b.created_at)}</div>
              </Link>
            </li>
          ))
        ) : (
          <div className='data_none'>
            <NoSymbolIcon />
            <span>작성한 글이 없습니다.</span>
          </div>
        )}
      </ol>

      <Pagination page={page} totalPage={totalPage} />
    </>
  );
}
