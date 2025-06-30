"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mypageComments } from "@/api/api";
import { useAuth } from "@/AuthContext";

import MyHeader from "@/my/myHeader";
import MyActivity from "../myActivity";

import formatPostDate from "@/components/formatDate";
import Pagination from "@/components/pagination";

interface comment {
  id: number;
  url_slug: string;
  title: string;
  comments: string;
  likes: number;
  views: number;
  created_at: string;
}

export default function MyComment() {
  const { isUserId } = useAuth();
  const [page, setPage] = useState<number>(1);

  const { data: commentBoards, isLoading } = useQuery({
    queryKey: ["mypageComments", isUserId],
    queryFn: () => mypageComments("comment", isUserId),
  });

  const totalPage = commentBoards?.totalPages || 1;

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />
        <div className='mypage_content'>
          {/* 내가 쓴 댓글 */}
          <div className='mypage_boardlist_common'>
            <div className='mypage_boardlist_single'>
              <MyActivity />
              <ul className='mypage_boardlist_common board_list'>
                {isLoading ? (
                  <div>잠시만 기다려주세요.</div>
                ) : commentBoards && commentBoards.posts.length > 0 ? (
                  commentBoards.posts.map((comment: comment, index: number) => (
                    <li key={comment.id}>
                      <a href={`/board/${comment.url_slug}/${comment.id}`}>
                        <span className='num'>{index + 1}</span>
                        <span className='title'>{comment.title}</span>
                        <div className='comment'>
                          <i></i>
                          {comment.comments}
                        </div>
                        <div className='like'>
                          <i></i>
                          {comment.likes}
                        </div>
                        <div className='view'>
                          <i></i>
                          {comment.views}
                        </div>
                        <div className='date'>{formatPostDate(comment.created_at)}</div>
                      </a>
                    </li>
                  ))
                ) : (
                  <div className='data_none'>작성한 글이 없습니다.</div>
                )}
              </ul>
            </div>
            <Pagination page={page} setPage={setPage} totalPage={totalPage} />
          </div>
        </div>
      </div>
    </sub>
  );
}
