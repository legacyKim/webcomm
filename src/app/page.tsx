"use client";

// import Image from "next/image";
import Search from "./components/search";

import Link from "next/link";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, fetchHomePop } from "./api/api";
import { Posts } from "./type/type";

import { useAuth } from "@/AuthContext";
import { useDropDown } from "app/func/hook/useDropDown";
import DropDownMenu from "app/components/dropDownMenu";
import formatPostDate from "app/components/formatDate";

import { ChatBubbleLeftEllipsisIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";

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
    const eventSource = new EventSource("/api/post/stream");

    eventSource.onmessage = () => {
      refetch(); // 새로운 데이터 요청
    };

    return () => {
      eventSource.close();
    };
  }, [refetch]);

  // writer dropdown
  const { writerDrop, dropPosition, userClick } = useDropDown({ messageToUser });
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

      {isUserId !== userInfoInDropMenu.userId && writerDrop && (
        <DropDownMenu
          style={{
            top: `${dropPosition.top + 22}px`,
            left: `${dropPosition.left + 14}px`,
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
                href='/board/popular'
                onClick={() => {
                  setBoardType("popular");
                }}>
                더 보기
              </Link>
            </div>
            <ol className='board_list'>
              {isLoadingPop ? (
                <div className='data_none'>잠시만 기다려주세요.</div>
              ) : (
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
                          onClick={(e) => {
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
              )}
            </ol>
          </div>
        </div>

        {/* board ad */}
        <div
          className='board_ad'
          style={{ width: "100%", height: "200px", backgroundColor: "#ddd", marginBottom: "32px" }}></div>

        <div className='board_double'>
          {/* board */}
          {homeData &&
            Object.keys(homeData).map((boardName) => (
              <div key={boardName} className='board'>
                <div className='board_top'>
                  <h2>{boardName}</h2>
                  <Link
                    href={`/board/${homeData[boardName].url_slug}`}
                    onClick={() => {
                      setBoardType("board");
                    }}>
                    더 보기
                  </Link>
                </div>
                <ol className='board_list'>
                  {homeData[boardName].posts.map((post: Posts) => (
                    <li key={`${boardName}${post.id}`}>
                      <Link href={`/board/${homeData[boardName].url_slug}/${post.id}`}>
                        <span className='title'>{post.title}</span>
                        <div className='view flex-start'>
                          <EyeIcon className='icon' />
                          {post.views}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
