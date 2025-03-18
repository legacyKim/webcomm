"use client";

import axios from 'axios';

import "../../../style/base.css";
import "../../../style/style.common.scss";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';

import Boardlist from "../../boardlist";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";

import { useAuth } from "../../../AuthContext";
import { fetchToken } from "../../../api/api";

interface Posts {
    posts: {
        rows: Array<{
            id: number;
            board_name: string;
            title: string;
            content: string;
            likes: number;
            dislikes: number;
            reports: number;
            created_at: Date;
            updated_at: Date;
            url_slug: string;
            user_id: string;
            user_nickname: string;
            views: number;
            comments: number;
        }>
    }
}

type Comments = {
    id: number;
    post_id: number;
    user_id: string;
    user_nickname: string;
    content: string;
    likes: number;
    dislikes: number;
    parent_id: number;
    created_at: Date;
    updated_at: Date;
};

type CommentList = {
    comments: {
        rows: Comments[];
    };
};

const TiptapViewer = ({ content }: { content: string }) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: content,
        editable: false,
    });

    if (!editor) return <p>로딩 중...</p>;

    return <EditorContent editor={editor} />;
};

export default function View() {

    const params = useParams();
    const router = useRouter();

    const { isUsername, isUserId, isUserNick } = useAuth();

    const [viewPost, setViewPost] = useState<Posts | null>(null);
    const [commentList, setCommentList] = useState<CommentList | null>(null);

    const [commentAdd, setCommentAdd] = useState<{ user_id: string; id: number; } | null>(null);
    const [recommentAdd, setRecommentAdd] = useState<{ user_id: string; id: number; recomment_id: number; } | null>(null);

    const [commentCorrect, setCommentCorrect] = useState<{ content: string; id: number; } | null>(null);
    const [recommentCorrect, setRecommentCorrect] = useState<{ content: string; id: number; recomment_id: number; } | null>(null);

    const [commentOption, setCommentOption] = useState<any>(null);

    // 컨텐츠 또는 댓글 패치
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (params.id) {
                    const postRes = await axios.get(`/api/post/${params.url_slug}/${params.id}`);
                    setViewPost(postRes.data);

                    if (postRes.data.response === true) {
                        const updateViews = async () => {
                            try {
                                await axios.put(`/api/post/${params.url_slug}/${params.id}`);
                            } catch (error) {
                                console.error(error);
                            }
                        };
                
                        updateViews();
                    }

                    const commentRes = await axios.get(`/api/comment/${params.id}`);
                    setCommentList(commentRes.data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [params.id]);

    // comment 좋아요 확인
    // useEffect(() => {
    //     if (isUserId) {
    //         const fetchData = async () => {
    //             const actionRes = await axios.get(`/api/comment/action`, { params: { user_id: isUserId } });
    //             setCommentOption(actionRes.data);
    //         }
    //         fetchData();
    //     }
    // }, [isUserId]);

    // 대댓글 및 언급 시에
    useEffect(() => {
        if (recommentRef.current) {
            setTimeout(() => {
                if (commentAdd?.user_id) {
                    recommentRef.current!.value = `@${commentAdd?.user_id} `;
                } else if (recommentAdd?.user_id) {
                    recommentRef.current!.value = `@${recommentAdd?.user_id} `;
                }
                recommentRef.current!.focus();
            }, 0);
        }
    }, [commentAdd, recommentAdd]);

    useEffect(() => {
        if (recommentRef.current) {
            setTimeout(() => {
                if (commentCorrect) {
                    recommentRef.current!.value = `${commentCorrect.content} `;
                } else if (recommentCorrect) {
                    recommentRef.current!.value = `${recommentCorrect.content} `;
                }
                recommentRef.current!.focus();
            }, 0);
        }
    }, [commentCorrect, recommentCorrect]);

    // 게시물 실시간 열람
    useEffect(() => {
        const eventSource = new EventSource("/api/post/stream");

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.event === "INSERT") {
                setViewPost((prev) => prev ? {
                    posts: {
                        rows: [...prev.posts.rows, data]
                    }
                } : null);
            } else if (data.event === "DELETE") {
                setViewPost((prev) => prev ? {
                    posts: {
                        rows: prev.posts.rows.filter((c) => c.id !== data.id)
                    }
                } : null);
            } else if (data.event === "UPDATE") {
                setViewPost((prev) => prev ? {
                    posts: {
                        rows: prev.posts.rows.map((c) =>
                            c.id === data.id ? { ...c, likes: data.likes, content: data.content } : c
                        )
                    }
                } : null);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // 댓글 실시간 열람
    useEffect(() => {
        const eventSource = new EventSource("/api/comment/stream");

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.event === "INSERT") {
                setCommentList((prev) => prev ? {
                    comments: {
                        rows: [...prev.comments.rows, data]
                    }
                } : null);
            } else if (data.event === "DELETE") {
                setCommentList((prev) => prev ? {
                    comments: {
                        rows: prev.comments.rows.filter((c) => c.id !== data.id)
                    }
                } : null);
            } else if (data.event === "UPDATE") {
                setCommentList((prev) => prev ? {
                    comments: {
                        rows: prev.comments.rows.map((c) =>
                            c.id === data.id ? { ...c, likes: data.likes, content: data.content } : c
                        )
                    }
                } : null);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // 게시물 삭제
    const postDel = async () => {
        const isConfirmed = confirm("삭제하시겠습니까?");
        if (isConfirmed) {
            await axios.delete(`/api/post/${params.url_slug}/${params.id}`);
            router.push(`/board/${params.url_slug}`);
        }
    }

    // 게시물 좋아요.
    const postLike = async () => {

        if (!isUsername) {
            const isConfirmed = confirm("로그인이 필요합니다.");
            if (isConfirmed) {
                router.push('/login');
                return;
            } else {
                return;
            }
        }

        await axios.post("/api/post/action/like", {
            isUserId, id: params.id
        });
    }

    // 게시물 신고.
    const postReport = async () => {
        const isConfirmed = confirm("신고하시겠습니까?");
        if (isConfirmed) {
            await axios.post("/api/post/action/report", {
                isUserId, id: params.id
            });
        }
    }

    // 게시물 스크랩.
    const postScrap = async () => {

        if (!isUsername) {
            const isConfirmed = confirm("로그인이 필요합니다.");
            if (isConfirmed) {
                router.push('/login');
                return;
            } else {
                return;
            }
        }

        await axios.post("/api/post/action/scrap", {
            isUserId, id: params.id
        });
    }

    // 댓글 등록
    const commentRef = useRef<HTMLTextAreaElement>(null);
    const recommentRef = useRef<HTMLTextAreaElement>(null);

    const commentPost = async (ref: React.RefObject<HTMLTextAreaElement | null>, id?: number) => {

        const comment = ref?.current?.value?.trim();
        const parentId = id;

        if (comment === "") {
            alert("댓글을 입력해 주세요.");
            return;
        }

        if (!isUsername) {
            alert("로그인이 필요합니다.");
            return;
        }

        const response = await axios.post(`/api/comment/${params.id}`, {
            comment,
            isUsername,
            isUserNick,
            parentId
        });

        if (response.data.success) {
            if (ref.current) ref.current.value = "";
            setCommentAdd(null);
            setRecommentAdd(null);
        }

    }

    const commentDelete = async (id: number) => {

        const isConfirmed = confirm("삭제하시겠습니까?");
        if (isConfirmed) {
            const response = await axios.delete(`/api/comment/${params.id}`, {
                data: { id },
            });

            if (response.data.success) {
                alert(response.data.message);
            }
        }
    }

    const commentUpdate = async (ref: React.RefObject<HTMLTextAreaElement | null>, id: number) => {

        const comment = ref?.current?.value?.trim();

        const response = await axios.put(`/api/comment/${params.id}`, {
            comment, id
        });

        if (response.data.success) {
            if (ref.current) ref.current.value = "";
            alert(response.data.message);
            setCommentCorrect(null);
            setRecommentCorrect(null);
        }
    }

    const commentLike = async (id: number) => {

        if (!isUsername) {
            const isConfirmed = confirm("로그인이 필요합니다.");
            if (isConfirmed) {
                router.push('/login');
            } else {
                return;
            }
        }

        await axios.post("/api/comment/action/like", {
            isUserId, id
        });
    }

    const [commentReportPop, setCommentReportPop] = useState<boolean>(false);

    const commentReport = async (id: number) => {

    }

    const commentFocus = async (ref: React.RefObject<HTMLTextAreaElement | null>) => {

        const response = await fetchToken();

        if (!response.authenticated) {
            ref.current?.blur();
            const isConfirmed = confirm("로그인이 필요합니다.");
            if (isConfirmed) {
                router.push('/login');
                return;
            } else {
                return;
            }
        }
    }

    if (!viewPost) return <div>Loading...</div>;

    return (
        <sub className="sub">

            <div className="view_page">
                <div className="view_header">
                    <b className="category">{viewPost?.posts?.rows?.[0]?.board_name}</b>
                    <h4 className="view_title">{viewPost?.posts?.rows?.[0]?.title}</h4>
                    <div className="view_info_area">
                        <div className='view_info'>
                            <span className="writer"><b>작성자</b> : {viewPost?.posts?.rows?.[0]?.user_nickname}</span>
                            <span className="view"><b>조회수</b> : {viewPost?.posts?.rows?.[0]?.views}</span>
                            <span className="view"><b>댓글</b> : {commentList?.comments?.rows.length}</span>
                            <span className="like"><b>공감</b> : {viewPost?.posts?.rows?.[0]?.likes}</span>
                            <span className="date"><b>작성일</b> : {new Date(viewPost?.posts?.rows?.[0]?.created_at).toLocaleDateString()}</span>
                        </div>

                        {(isUsername && isUsername === viewPost?.posts?.rows?.[0]?.user_id) && (
                            <div className='view_btn'>
                                <Link href={`/write/${params.id}`} type='button'>글 수정</Link>
                                <button type='button' onClick={() => { postDel(); }}>글 삭제</button>
                            </div>
                        )}

                    </div>
                </div>

                <div className="view_content">
                    <TiptapViewer content={viewPost?.posts?.rows?.[0]?.content} />
                </div>

                <div className="view_content_btn">
                    <button type='button' onClick={() => { postReport(); }}>신고</button>
                    <button type='button' onClick={() => { postScrap(); }}>스크랩</button>
                    <button type='button' onClick={() => { postLike(); }}>공감</button>
                </div>

                <div className="view_comment">
                    <div className="comment_top">
                        <b>댓글</b>
                        <span className="comment_num">( {commentList?.comments?.rows.length} )</span>
                        {/* <span className="comment_num"><i></i>{viewPost?.posts?.comments}</span> */}
                    </div>

                    <div className="comment_list">

                        {commentList && commentList?.comments?.rows.filter((row) => row.parent_id === null).map((comment: Comments) => (

                            <div key={comment.id} className={`comment_box`}>
                                <div className="comment_info">
                                    <span className="writer">{comment.user_nickname}</span>
                                    <div className="comment_btn">

                                        <button type='button' onClick={() => {

                                            if (!isUsername) {
                                                const isConfirmed = confirm("로그인이 필요합니다.");
                                                if (isConfirmed) {
                                                    router.push('/login');
                                                } else {
                                                    return;
                                                }
                                            }

                                            setCommentAdd({ user_id: comment.user_id, id: comment.id });
                                            setRecommentAdd(null);
                                            setCommentCorrect(null);
                                            setRecommentCorrect(null);
                                        }}>대댓글</button>
                                        {comment.user_id !== isUsername && (
                                            <>
                                                <button type='button' onClick={() => { commentLike(comment.id); }}>공감</button>
                                                <button type='button' onClick={() => { console.log("button"); }}>신고</button>
                                            </>
                                        )}

                                        {isUsername === comment.user_id && (
                                            <>
                                                <button onClick={() => {
                                                    setCommentAdd(null); setRecommentAdd(null);
                                                    setRecommentCorrect(null); setCommentCorrect({ content: comment.content, id: comment.id });
                                                }}>수정</button>
                                                <button onClick={() => { commentDelete(comment.id); }}>삭제</button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="comment_content">
                                    <pre>{comment.content}</pre>
                                    <i className="comment_content_likes">{comment.likes}</i>
                                </div>

                                {((commentAdd?.user_id !== null && commentAdd?.id === comment.id) || (commentCorrect?.id === comment.id)) && (
                                    <div className="comment_add re">
                                        <textarea onFocus={() => { commentFocus(recommentRef); }} ref={recommentRef}></textarea>
                                        {commentCorrect ? (
                                            <button onClick={() => { commentUpdate(recommentRef, comment.id); }}>
                                                댓글 수정
                                            </button>
                                        ) : (
                                            <button onClick={() => { commentPost(recommentRef, comment.id); }}>
                                                댓글 추가
                                            </button>
                                        )}
                                    </div>
                                )}

                                {
                                    commentList?.comments?.rows.filter((row) => row.parent_id === comment.id).map((recomment: Comments) => (
                                        <div key={recomment.id} className={`comment_box re`}>
                                            <div className="comment_info">
                                                <span className="writer">{recomment.user_nickname}</span>
                                                <div className="comment_btn">

                                                    {isUsername !== recomment.user_id && (
                                                        <>
                                                            <button type="button" onClick={() => {

                                                                if (!isUsername) {
                                                                    const isConfirmed = confirm("로그인이 필요합니다.");
                                                                    if (isConfirmed) {
                                                                        router.push('/login');
                                                                    } else {
                                                                        return;
                                                                    }
                                                                }

                                                                setRecommentAdd({ user_id: recomment.user_id, id: comment.id, recomment_id: recomment.id });
                                                                setCommentAdd(null);
                                                                setCommentCorrect(null);
                                                                setRecommentCorrect(null);
                                                            }}>언급</button>
                                                            <button type="button" onClick={() => { commentLike(recomment.id); }}>공감</button>
                                                            <button type="button" onClick={() => { console.log("button"); }}>신고</button>
                                                        </>
                                                    )}

                                                    {isUsername === recomment.user_id && (
                                                        <>
                                                            <button onClick={() => {
                                                                setCommentAdd(null); setRecommentAdd(null);
                                                                setCommentCorrect(null); setRecommentCorrect({ content: recomment.content, id: comment.id, recomment_id: recomment.id });
                                                            }}>수정</button>
                                                            <button onClick={() => { commentDelete(recomment.id); }}>삭제</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="comment_content">
                                                <pre>{recomment.content}</pre>
                                                <i className="comment_content_likes">{recomment.likes}</i>
                                            </div>

                                            {((recommentAdd?.user_id !== null && recommentAdd?.id === comment.id && recommentAdd?.recomment_id === recomment.id) || (recommentCorrect?.id === comment.id && recommentCorrect?.recomment_id === recomment.id)) && (
                                                <div className="comment_add re">
                                                    <textarea onFocus={() => { commentFocus(recommentRef); }} ref={recommentRef}></textarea>
                                                    {recommentCorrect ? (
                                                        <button onClick={() => { commentUpdate(recommentRef, recomment.id); }}>
                                                            댓글 수정
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => { commentPost(recommentRef, comment.id); }}>
                                                            댓글 추가
                                                        </button>
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    ))
                                }

                            </div>
                        ))}

                    </div>
                </div>

                <div className="comment_add">
                    <textarea onFocus={() => { commentFocus(commentRef); }} ref={commentRef}></textarea>
                    <button onClick={() => { commentPost(commentRef); }}>댓글 추가</button>
                </div>
            </div>

            <div className="board_top">
                <select>
                    <option></option>
                </select>
                <div className="btn_wrap btn_wrap_mb0">
                    <Link href={`/board/${params.url_slug}`}>목록으로</Link>
                    <Link href={`/write`}>글쓰기</Link>
                </div>
            </div>

            <Boardlist url_slug={params.url_slug as string} />

        </sub >
    )
}
