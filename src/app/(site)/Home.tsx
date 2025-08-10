"use client";

import Search from "@/components/search";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { Posts, initDataPosts } from "@/type/type";

import { useAuth } from "@/contexts/AuthContext";
import { useDropDown } from "@/func/hook/useDropDown";
import DropDownMenu from "@/components/dropDownMenu";
import formatPostDate from "@/components/formatDate";

// import { fetchHome } from "@/api/api";

import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
// import { SSE_BASE_URL } from "@/lib/sse";

import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { NoSymbolIcon } from "@heroicons/react/24/solid";

export default function Home({
  popBoardposts,
}: {
  popBoardposts: initDataPosts;
}) {
  const { isUserId, setBoardType, messageToUser } = useAuth();

  // const { data: homeData } = useQuery({
  //   queryKey: ["home", isUserId],
  //   queryFn: () => fetchHome(isUserId),
  //   initialData: eachBoardPosts,
  //   enabled: !!isUserId,
  //   staleTime: 1000 * 60,
  // });

  // 인기글 로딩 상태
  const [isLoadingPop, setIsLoadingPop] = useState(true);
  useEffect(() => {
    if (popBoardposts) {
      setIsLoadingPop(false);
    }
  }, []);

  //   const {
  //     data: popularPosts,
  //     isLoading: isLoadingPop,
  //     refetch,
  //   } = useQuery({
  //     queryKey: ["popularPosts", isUserId],
  //     queryFn: () => fetchHomePop(1, 10, isUserId),
  //   });

  // 인기글
  //   useEffect(() => {
  //     const eventSource = new EventSource(`${SSE_BASE_URL}/posts/stream`);

  //     eventSource.onmessage = () => {
  //       refetch(); // 새로운 데이터 요청
  //     };

  //     return () => {
  //       eventSource.close();
  //     };
  //   }, [refetch]);

  // writer dropdown
  const writerRef = useRef<HTMLDivElement>(null);
  const { writerDrop, dropPosition, userClick } = useDropDown({
    messageToUser,
  });
  const [userInfoInDropMenu, setUserInfoInDropMenu] = useState<{
    userId: number;
    userNickname: string;
  }>({
    userId: 0,
    userNickname: "",
  });

  return (
    <main>
      <Search />

      {writerDrop && (
        <DropDownMenu
          style={{
            top: `${dropPosition.top + (writerRef.current?.offsetHeight ?? 0)}px`,
            left: `${dropPosition.left}px`,
          }}
          userInfoInDropMenu={userInfoInDropMenu}
        />
      )}

      <div className="board_wrap">
        <div className="board_single">
          {/* board best */}
          <div className="board">
            <div className="board_top">
              <h2>베스트 게시글</h2>
              <Link
                className="more"
                href="/board/popular"
                onClick={() => {
                  setBoardType("popular");
                }}
              >
                <span>더 보기</span>
                <ChevronRightIcon />
              </Link>
            </div>
            <ol className="board_list">
              {isLoadingPop ? (
                <div className="data_wait">
                  <span>잠시만 기다려 주세요.</span>
                  <div className="dots">
                    <span className="dot dot1">.</span>
                    <span className="dot dot2">.</span>
                    <span className="dot dot3">.</span>
                  </div>
                </div>
              ) : popBoardposts?.posts.length !== 0 ? (
                popBoardposts?.posts.map((post: Posts) => (
                  <li key={post.id}>
                    <Link
                      href={`/board/popular/${post.id}`}
                      onClick={() => setBoardType("popular")}
                    >
                      <div className="title">
                        <b className="category">{post.board_name}</b>
                        <span>{post.title}</span>
                      </div>
                      <div className="board_list_info_wrap">
                        <div className="comment flex-start">
                          <ChatBubbleLeftEllipsisIcon className="icon" />
                          <span className="icon_text">{post.comments}</span>
                        </div>
                        <div
                          className="writer"
                          ref={writerRef}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            userClick(e);
                            setUserInfoInDropMenu({
                              userId: Number(post.user_id),
                              userNickname: post.user_nickname,
                            });
                          }}
                        >
                          <img
                            className="profile_img"
                            src={post.user_profile ?? "/profile/basic.png"}
                            alt={`${post.user_nickname}의 프로필`}
                          />
                          <span className="writer_name">
                            {post.user_nickname}
                          </span>
                        </div>
                        <div className="like flex-start">
                          <HeartIcon className="icon" />
                          <span className="icon_text">{post.likes}</span>
                        </div>
                        <div className="view flex-start">
                          <EyeIcon className="icon" />
                          <span className="icon_text">{post.views}</span>
                        </div>
                        <div className="date flex-start">
                          {formatPostDate(post.created_at)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <div className="data_none">
                  <NoSymbolIcon />
                  <span>작성한 글이 없습니다.</span>
                </div>
              )}
            </ol>
          </div>
        </div>

        {/* board ad */}
        <div
          className="board_ad"
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: "#ddd",
            marginBottom: "32px",
            display: "none",
          }}
        ></div>

        {/* <div className='board_double'>
          {homeData &&
            Object.keys(homeData).map((boardName) => {
              const board = homeData[boardName];
              const posts = Array.isArray(board.posts) ? board.posts : [];

              return (
                <div key={boardName} className='board'>
                  <div className='board_top'>
                    <h2>{boardName}</h2>
                    <Link className='more' href={`/board/${board.url_slug}`} onClick={() => setBoardType("board")}>
                      <span>더 보기</span>
                      <ChevronRightIcon />
                    </Link>
                  </div>

                  <ol className='board_list'>
                    {posts.length > 0 ? (
                      posts.map((post: Posts) => (
                        <li key={`${boardName}${post.id}`}>
                          <Link href={`/board/${board.url_slug}/${post.id}`} onClick={() => setBoardType("board")}>
                            <span className='title'>{post.title}</span>
                            <div className='view flex-start'>
                              <EyeIcon className='icon' />
                              <span className='icon_text'>{post.views}</span>
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
              );
            })}
        </div> */}
      </div>
    </main>
  );
}
