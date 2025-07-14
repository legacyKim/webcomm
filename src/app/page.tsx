"use client";

import Search from "./components/search";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, fetchHomePop } from "./api/api";
import { Posts } from "./type/type";

import { useAuth } from "@/AuthContext";
import { useDropDown } from "@/func/hook/useDropDown";
import { useLoginCheck } from "@/func/hook/useLoginCheck";
import DropDownMenu from "@/components/dropDownMenu";
import formatPostDate from "@/components/formatDate";

import { ChatBubbleLeftEllipsisIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { SSE_BASE_URL } from "@/lib/sse";

import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { NoSymbolIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const { isUserId, setBoardType, messageToUser } = useAuth();

  const { data: homeData } = useQuery({
    queryKey: ["home", isUserId],
    queryFn: () => fetchHome(isUserId),
  });

  const {
    data: popularPosts,
    isLoading: isLoadingPop,
    refetch,
  } = useQuery({
    queryKey: ["popularPosts", isUserId],
    queryFn: () => fetchHomePop(1, 10, isUserId),
  });

  // 인기글
  useEffect(() => {
    const eventSource = new EventSource(`${SSE_BASE_URL}/posts/stream`);

    eventSource.onmessage = () => {
      refetch(); // 새로운 데이터 요청
    };

    return () => {
      eventSource.close();
    };
  }, [refetch]);

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

  const loginCheck = useLoginCheck();

  return (
    <main>
      <Search />

      {isUserId && isUserId !== userInfoInDropMenu.userId && writerDrop && (
        <DropDownMenu
          style={{
            top: `${dropPosition.top + (writerRef.current?.offsetHeight ?? 0)}px`,
            left: `${dropPosition.left}px`,
          }}
          userInfoInDropMenu={userInfoInDropMenu}
        />
      )}

      <div className='board_wrap'>
        <div className='board_single'>
          {/* board best */}
          <div className='board'>
            <div className='board_top'>
              <h2>베스트 게시글</h2>
              <Link
                className='more'
                href='/board/popular'
                onClick={() => {
                  setBoardType("popular");
                }}>
                <ChevronRightIcon />
              </Link>
            </div>
            <ol className='board_list'>
              {isLoadingPop ? (
                <div className='data_wait'>
                  <span>잠시만 기다려 주세요.</span>
                  <div className='dots'>
                    <span className='dot dot1'>.</span>
                    <span className='dot dot2'>.</span>
                    <span className='dot dot3'>.</span>
                  </div>
                </div>
              ) : popularPosts.length !== 0 ? (
                popularPosts.map((post: Posts) => (
                  <li key={post.id}>
                    <Link href={`/board/${post.url_slug}/${post.id}`}>
                      <div className='title'>
                        <b className='category'>{post.board_name}</b>
                        <span>{post.title}</span>
                      </div>
                      <div className='board_list_info_wrap'>
                        <div className='comment flex-start'>
                          <ChatBubbleLeftEllipsisIcon className='icon' />
                          {post.comments}
                        </div>
                        <div
                          className='writer'
                          ref={writerRef}
                          onClick={async (e) => {
                            const ok = await loginCheck();
                            if (!ok) return;

                            userClick(e);
                            setUserInfoInDropMenu({
                              userId: Number(post.user_id),
                              userNickname: post.user_nickname,
                            });
                          }}>
                          <span className='writer_name'>{post.user_nickname}</span>
                        </div>
                        <div className='like flex-start'>
                          <HeartIcon className='icon' />
                          {post.likes}
                        </div>
                        <div className='view flex-start'>
                          <EyeIcon className='icon' />
                          {post.views}
                        </div>
                        <div className='date flex-start'>{formatPostDate(post.created_at)}</div>
                      </div>
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
          </div>
        </div>

        {/* board ad */}
        <div
          className='board_ad'
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: "#ddd",
            marginBottom: "32px",
            display: "none",
          }}></div>

        <div className='board_double'>
          {/* board */}
          {homeData &&
            Object.keys(homeData).map((boardName) => (
              <div key={boardName} className='board'>
                <div className='board_top'>
                  <h2>{boardName}</h2>
                  <Link
                    className='more'
                    href={`/board/${homeData[boardName].url_slug}`}
                    onClick={() => {
                      setBoardType("board");
                    }}>
                    <ChevronRightIcon />
                  </Link>
                </div>
                <ol className='board_list'>
                  {Array.isArray(homeData[boardName].posts) && homeData[boardName].posts.length > 0 ? (
                    homeData[boardName].posts.map((post: Posts) => (
                      <li key={`${boardName}${post.id}`}>
                        <Link href={`/board/${homeData[boardName].url_slug}/${post.id}`}>
                          <span className='title'>{post.title}</span>
                          <div className='view flex-start'>
                            <EyeIcon className='icon' />
                            {post.views}
                          </div>
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
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
