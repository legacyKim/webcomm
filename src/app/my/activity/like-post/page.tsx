"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mypageLikeWrite } from "@/api/api";
import { useAuth } from "@/AuthContext";

import MyHeader from "@/my/myHeader";
import MyActivity from "../myActivity";

import formatPostDate from "app/components/formatDate";
import Pagination from "app/components/pagination";

export default function MyLike() {
  const { isUserId } = useAuth();
  const [page, setPage] = useState<number>(1);

  const { data: likePostBoards, isLoading } = useQuery({
    queryKey: ["mypageLikeWrite", isUserId],
    queryFn: () => mypageLikeWrite("like-post", isUserId, page),
  });

  const totalPage = likePostBoards?.totalPages || 1;

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />
        <div className='mypage_content'>
          {/* 공감한 글 */}
          <div className='mypage_boardlist_common'>
            <div className='mypage_boardlist_single'>
              <MyActivity />
              <ul className='mypage_boardlist_common board_list'>
                {isLoading ? (
                  <div>잠시만 기다려주세요.</div>
                ) : likePostBoards && likePostBoards.posts.length > 0 ? (
                  likePostBoards.posts.map((post: any, index: number) => (
                    <li key={post.id}>
                      <a href={`/board/${post.url_slug}/${post.id}`}>
                        <span className='num'>{index + 1}</span>
                        <span className='title'>{post.title}</span>
                        <div className='comment'>
                          <i></i>
                          {post.comments}
                        </div>
                        <div className='like'>
                          <i></i>
                          {post.likes}
                        </div>
                        <div className='view'>
                          <i></i>
                          {post.views}
                        </div>
                        <div className='date'>{formatPostDate(post.created_at)}</div>
                      </a>
                    </li>
                  ))
                ) : (
                  <div className='data_none'>작성한 글이 없습니다.</div>
                )}
              </ul>
              <Pagination page={page} setPage={setPage} totalPage={totalPage} />
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
