"use client";

import { useState, useRef } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBoardData, fetchUserPostData, fetchUserCommentData, fetchSearchData, fetchBoardPop } from "@/api/api";
import { Posts, initDataPosts } from "@/type/type";
import { useAuth } from "@/AuthContext";
import { useQuery } from "@tanstack/react-query";

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

interface BoardlistProps {
  url_slug: string | null;
  page: number;
  boardType: string;
  limit: number;
  initData?: initDataPosts;
}

// BoardList React Query CSR
const getBoardQueryFn = (boardType: string) => {
  return async ({ queryKey }: { queryKey: [string | null, number, number, number | null] }) => {
    const [url_slug, page, limit, userId] = queryKey;

    if (boardType === "popular") {
      return await fetchBoardPop(page, limit, userId);
    } else if (boardType === "userPost") {
      return await fetchUserPostData(url_slug, page, limit);
    } else if (boardType === "userComment") {
      return await fetchUserCommentData(url_slug, page, limit);
    } else if (boardType === "search") {
      return await fetchSearchData(url_slug, page, limit, userId);
    } else {
      return await fetchBoardData(url_slug, page, limit, userId);
    }
  };
};

export default function Boardlist({ url_slug, page, boardType, limit, initData }: BoardlistProps) {
  const { isUserId, messageToUser } = useAuth();
  // const [postData, setPostData] = useState<initDataPosts>(initData || { posts: [] });

  const { data: postData } = useQuery({
    queryKey: [url_slug, page, limit, isUserId],
    queryFn: getBoardQueryFn(boardType),
    staleTime: 0,
    initialData: initData && initData.initUrlSlug === url_slug ? initData : undefined,
  });

  console.log(postData);

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
        {postData?.posts?.length > 0 ? (
          postData?.posts.map((b: Posts) => (
            <li key={`${b.url_slug}_${b.id}`}>
              <Link
                href={`/board/${boardType === "popular" ? "popular" : url_slug}/${b.id}/?${new URLSearchParams({
                  page: String(page),
                })}`}>
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
                  {b.comment_count}
                </div>
                <span
                  className='writer'
                  ref={writerRef}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
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

      <Pagination page={page} totalPage={totalPage} type={boardType} url_slug={url_slug} />
    </>
  );
}
