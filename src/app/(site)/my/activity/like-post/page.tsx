"use client";

import { useQuery } from "@tanstack/react-query";
import { mypageLikeWrite } from "@/api/api";
import { useAuth } from "@/AuthContext";
import { useSearchParams } from "next/navigation";

import MyHeader from "@/(site)/my/myHeader";
import MyActivity from "../myActivity";

import formatPostDate from "@/components/formatDate";
import Pagination from "@/components/pagination";

import { NoSymbolIcon } from "@heroicons/react/24/solid";

interface post {
  id: number;
  url_slug: string;
  title: string;
  comments: string;
  likes: number;
  views: number;
  created_at: string;
}

export default function MyLike() {
  const { isUserId } = useAuth();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const { data: likePostBoards, isLoading } = useQuery({
    queryKey: ["mypageLikeWrite", isUserId, page],
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
                  <div className='data_wait'>
                    <span>잠시만 기다려 주세요.</span>
                    <div className='dots'>
                      <span className='dot dot1'>.</span>
                      <span className='dot dot2'>.</span>
                      <span className='dot dot3'>.</span>
                    </div>
                  </div>
                ) : likePostBoards && likePostBoards.posts.length > 0 ? (
                  likePostBoards.posts.map((post: post, index: number) => (
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
                  <div className='data_none'>
                    <NoSymbolIcon />
                    <span>작성한 글이 없습니다.</span>
                  </div>
                )}
              </ul>
              <Pagination page={page} totalPage={totalPage} type={"my"} cate={"like-post"} />
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
