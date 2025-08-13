"use client";

import { useQuery } from "@tanstack/react-query";
import { mypageLikeComments } from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";

import MyHeader from "@/(site)/my/myHeader";
import MyActivity from "../myActivity";
import { myActivityType } from "@/type/type";

import formatPostDate from "@/components/formatDate";
import Pagination from "@/components/pagination";

import { NoSymbolIcon } from "@heroicons/react/24/solid";
import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function MyLikeComment() {
  const { isUserId } = useAuth();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const { data: likeCommentBoards, isLoading } = useQuery({
    queryKey: ["mypageLikeComments", isUserId, page],
    queryFn: () => mypageLikeComments("like-comment", isUserId, page),
  });

  const totalPage = likeCommentBoards?.totalPages || 1;

  return (
    <sub className="sub">
      <div className="mypage">
        <MyHeader />
        <div className="mypage_content">
          {/* 공감한 댓글 */}
          <div className="mypage_boardlist_common">
            <div className="mypage_boardlist_single">
              <MyActivity />
              <ul className="board_list">
                {isLoading ? (
                  <div className="data_wait">
                    <span>잠시만 기다려 주세요.</span>
                    <div className="dots">
                      <span className="dot dot1">.</span>
                      <span className="dot dot2">.</span>
                      <span className="dot dot3">.</span>
                    </div>
                  </div>
                ) : likeCommentBoards && likeCommentBoards.posts.length > 0 ? (
                  likeCommentBoards.posts.map(
                    (comment: myActivityType, index: number) => (
                      <li key={comment.id}>
                        <a href={`/board/${comment.url_slug}/${comment.id}`}>
                          <span className="num">{index + 1}</span>
                          <span className="title">
                            <span className="category">
                              {comment.board_name}
                            </span>
                            {comment.title}
                          </span>
                          <div className="comment">
                            <ChatBubbleLeftEllipsisIcon className="icon" />
                            {comment.comments}
                          </div>
                          <div className="like">
                            <HeartIcon className="icon" />
                            {comment.likes}
                          </div>
                          <div className="view">
                            <EyeIcon className="icon" />
                            {comment.views}
                          </div>
                          {/* <span className="comment"><i></i>33</span> */}
                          <div className="date">
                            {formatPostDate(comment.created_at)}
                          </div>
                        </a>
                      </li>
                    )
                  )
                ) : (
                  <div className="data_none">
                    <NoSymbolIcon />
                    <span>작성한 글이 없습니다.</span>
                  </div>
                )}
              </ul>
              <Pagination
                page={page}
                totalPage={totalPage}
                type={"my"}
                cate={"like-comment"}
              />
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
