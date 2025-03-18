"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBoardData } from "../api/api"
import { Posts } from '../type/type';

import Link from 'next/link';

export default function Boardlist({ url_slug }: { url_slug: string }) {

    const queryClient = useQueryClient();

    const { data: postData, error, isLoading } = useQuery({
        queryKey: ["eachBoardData", url_slug],
        queryFn: () => fetchBoardData(url_slug),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

    // 게시판 실시간 업데이트
    useEffect(() => {
        const eventSource = new EventSource("/api/post/stream");

        // 새 게시글 또는 삭제된 게시글의 정보를 받으면 데이터 갱신
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            queryClient.setQueryData(["eachBoardData", url_slug], (oldData: { posts: Posts[] }) => {
                if (!oldData) return oldData;

                if (data.event === "INSERT") {
                    return {
                        ...oldData,
                        posts: [data, ...oldData.posts], // 새 게시글 추가
                    };
                } else if (data.event === "DELETE") {
                    return {
                        ...oldData,
                        posts: oldData.posts.filter((post: Posts) => post.id !== data.id), // 삭제된 게시글 제거
                    };
                } else if (data.event === "UPDATE") {
                    return {
                        ...oldData,
                        posts: oldData.posts.map((post: Posts) =>
                            post.id === data.id
                                ? { ...post, likes: data.likes, views: data.views, title: data.title, } // 조회수, 공감 업데이트
                                : post
                        ),
                    };
                }

                return oldData;
            });
        };

        return () => {
            eventSource.close();
        };
    }, [url_slug]);

    if (isLoading) return <div>Loading...</div>;
    if (error instanceof Error) return <div>Error: {error.message}</div>;

    return (
        <>
            <ol className="board_list">
                {!isLoading && postData?.posts.length > 0 ? (postData?.posts.map((b: Posts, i: number) => (
                    <li key={`${b.url_slug}_${b.id}`}>
                        <Link href={`/board/${url_slug}/${b.id}`}>
                            <span className="num">{b.post_number}</span>
                            <span className="title">{b.title}</span>
                            <span className="writer">{b.user_nickname}</span>
                            <span className="like"><i></i>{b.likes}</span>
                            <span className="view"><i></i>{b.views}</span>
                            {/* <span className="comment"><i></i>33</span> */}
                            <span className="date">{new Date(b.created_at).toLocaleDateString()}</span>
                        </Link>
                    </li>
                ))) : (
                    <div className='nodata'>
                        <span>게시물이 없습니다.</span>
                    </div>
                )}
            </ol>

            <div className="pagination">

                <button>맨처음으로</button>
                <button>이전</button>
                <Link href="/" >1</Link>
                <Link href="/" >2</Link>
                <Link href="/" >3</Link>
                <Link href="/" >4</Link>
                <Link href="/" >5</Link>
                <Link href="/" >6</Link>
                <Link href="/" >7</Link>
                <Link href="/" >8</Link>
                <Link href="/" >9</Link>
                <Link href="/" >10</Link>
                <button>다음</button>
                <button>마지막으로</button>

            </div>
        </>
    )

}