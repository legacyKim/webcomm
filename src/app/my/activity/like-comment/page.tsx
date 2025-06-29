"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mypageLikeComments } from "@/api/api";
import { useAuth } from "@/AuthContext";

import MyHeader from "@/my/myHeader";
import MyActivity from "../myActivity";

import formatPostDate from "app/components/formatDate";
import Pagination from "app/components/pagination";

export default function MyLikeComment() {
  const { isUserId } = useAuth();
  const [page, setPage] = useState<number>(1);

  const { data: likeCommentBoards, isLoading } = useQuery({
    queryKey: ["mypageLikeComments", isUserId],
    queryFn: () => mypageLikeComments("like-comment", isUserId),
  });

  const totalPage = likeCommentBoards?.totalPages || 1;

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />
        <div className='mypage_content'>
          {/* 공감한 댓글 */}
          <div className='mypage_boardlist_common'>
            <div className='mypage_boardlist_single'>
              <MyActivity />
              <ul className='mypage_boardlist_common board_list'>
                {isLoading ? (
                  <div>잠시만 기다려주세요.</div>
                ) : likeCommentBoards && likeCommentBoards.posts.length > 0 ? (
                  likeCommentBoards.posts.map((comment: any, index: number) => (
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
                        {/* <span className="comment"><i></i>33</span> */}
                        <div className='date'>{formatPostDate(comment.created_at)}</div>
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
