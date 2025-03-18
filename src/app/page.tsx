"use client";

import "./style/base.css";
import "./style/font.css";
import "./style/fontello/css/fontello.css";
import "./style/fontello/css/animation.css";

// import Image from "next/image";
import Search from "./components/search";
import "./style/style.common.scss"

import Link from 'next/link';

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, fetchHomePop } from './api/api';
import { Posts } from './type/type'

export default function Home() {

  const { data: homeData, isLoading } = useQuery({ queryKey: ["home"], queryFn: fetchHome });

  const { data: popularPosts, refetch } = useQuery({
    queryKey: ["popularPosts"],
    queryFn: fetchHomePop,
    staleTime: 1000 * 60 * 20, // 20분마다 새로고침
  });

  console.log(popularPosts);

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

  return (
    <main>
      <Search />

      <div className="board_wrap">
        <div className="board_single">

          {/* board best */}
          <div className="board">
            <div className="board_top">
              <h2>베스트 게시글</h2>
              <Link href="/board">더 보기</Link>
            </div>
            <ol className="board_list">
              {popularPosts && popularPosts.map((post: Posts) => (
                <li key={post.id}>
                  <Link href={`/board/${post.url_slug}/${post.id}`}>
                    <b className="category">{post.board_name}</b>
                    <span className="title">{post.title}</span>
                    <span className="writer">{post.user_nickname}</span>
                    <div className="like">
                      <i></i>
                      {post.likes}
                    </div>
                    <div className="view">
                      <i></i>
                      {post.views}
                    </div>
                    <div className="comment">
                      <i></i>
                      {post.comments}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* board ad */}
        <div className="board_ad" style={{ width: '100%', height: '200px', backgroundColor: '#ddd', marginBottom: '32px' }}></div>

        <div className="board_double">

          {/* board */}
          {homeData && Object.keys(homeData).map((boardName) => (
            <div key={boardName} className="board">
              <div className="board_top">
                <h2>{boardName}</h2>
                <Link href={`/board/${homeData[boardName].url_slug}`}>더 보기</Link>
              </div>
              <ol className="board_list">
                {homeData[boardName].posts.map((post: Posts) => (
                  <li key={`${boardName}${post.id}`}>
                    <Link href={`/board/${homeData[boardName].url_slug}/${post.id}`}>
                      <span className="title">{post.title}</span>
                      <div className="view"><i></i>{post.likes}</div>
                      <span className="writer">{post.user_id}</span>
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
