"use client";

import axios from "axios";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Boardlist from "@/board/boardlist";

import { useAuth } from "@/AuthContext";
import { useDropDown } from "@/func/hook/useDropDown";
import DropDownMenu from "@/components/dropDownMenu";
import TiptapViewer from "@/components/tiptapViewer";

import CommentEditor from "./commentEditor";

import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
  ListBulletIcon,
  PencilSquareIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

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
      user_id: number;
      user_nickname: string;
      user_profile: string;
      views: number;
      comments: number;
    }>;
  };
}

type Comments = {
  id: number;
  post_id: number;
  user_id: number;
  user_nickname: string;
  content: string;
  likes: number;
  dislikes: number;
  profile: string | null;
  parent_id: number | null;
  created_at: Date;
  updated_at: Date;
};

type CommentList = {
  comments: {
    rows: Comments[];
  };
};

export default function View() {
  const params = useParams();
  const router = useRouter();

  const { isUserId, isUserNick, messageToUser, boardType } = useAuth();
  const [limit, setLimit] = useState(10);

  const [viewPost, setViewPost] = useState<Posts | null>(null);
  const [commentList, setCommentList] = useState<CommentList | null>(null);

  const [commentAdd, setCommentAdd] = useState<{ user_id: number; id: number } | null>(null);
  const [recommentAdd, setRecommentAdd] = useState<{ user_id: number; id: number; recomment_id: number } | null>(null);

  const [commentCorrect, setCommentCorrect] = useState<{ content: string; id: number } | null>(null);
  const [recommentCorrect, setRecommentCorrect] = useState<{
    content: string;
    id: number;
    recomment_id: number;
  } | null>(null);

  // 컨텐츠 또는 댓글 패치
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.id) {
          const postRes = await axios.get(`/api/post/${params.url_slug}/${params.id}`);
          setViewPost(postRes.data);

          const commentRes = await axios.get(`/api/comment/${params.id}`);
          setCommentList(commentRes.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [params.id, params.url_slug]);

  // 게시물 실시간 열람
  useEffect(() => {
    const eventSource = new EventSource("/api/post/stream");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "INSERT") {
        setViewPost((prev) =>
          prev
            ? {
                posts: {
                  rows: [...prev.posts.rows, data],
                },
              }
            : null,
        );
      } else if (data.event === "DELETE") {
        setViewPost((prev) =>
          prev
            ? {
                posts: {
                  rows: prev.posts.rows.filter((c) => c.id !== data.id),
                },
              }
            : null,
        );
      } else if (data.event === "UPDATE") {
        setViewPost((prev) =>
          prev
            ? {
                posts: {
                  rows: prev.posts.rows.map((c) =>
                    c.id === data.id ? { ...c, likes: data.likes, content: data.content } : c,
                  ),
                },
              }
            : null,
        );
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
        setCommentList((prev) =>
          prev
            ? {
                comments: {
                  rows: [...prev.comments.rows, data],
                },
              }
            : null,
        );
      } else if (data.event === "DELETE") {
        setCommentList((prev) =>
          prev
            ? {
                comments: {
                  rows: prev.comments.rows.filter((c) => c.id !== data.id),
                },
              }
            : null,
        );
      } else if (data.event === "UPDATE") {
        setCommentList((prev) =>
          prev
            ? {
                comments: {
                  rows: prev.comments.rows.map((c) =>
                    c.id === data.id ? { ...c, likes: data.likes, content: data.content } : c,
                  ),
                },
              }
            : null,
        );
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
      try {
        const res = await axios.post(`/api/post/${params.url_slug}/${params.id}`);

        if (res.data.success) {
          alert("삭제되었습니다.");
          router.push(`/board/${params.url_slug}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  // 게시물 좋아요.
  const postLike = async () => {
    if (isUserId === 0) {
      const isConfirmed = confirm("로그인이 필요합니다.");
      if (isConfirmed) {
        router.push("/login");
        return;
      } else {
        return;
      }
    }

    await axios.post("/api/post/action/like", {
      isUserId,
      id: params.id,
    });
  };

  // 게시물 신고.
  const postReport = async () => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (!reason) return;

    try {
      const res = await axios.post("/api/post/action/report", {
        isUserId,
        id: params.id,
        reason,
      });

      if (res.data.success) {
        alert("신고가 접수되었습니다.");
      } else if (!res.data.success) {
        alert("이미 신고한 게시글입니다.");
      } else {
        alert(res.data.message || "신고에 실패했습니다.");
      }
    } catch (error) {
      console.error("신고 실패:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 게시물 스크랩.
  const postScrap = async () => {
    alert("준비 중 입니다!");
    if (isUserId === 0) {
      const isConfirmed = confirm("로그인이 필요합니다.");
      if (isConfirmed) {
        router.push("/login");
        return;
      } else {
        return;
      }
    }

    await axios.post("/api/post/action/scrap", {
      isUserId,
      id: params.id,
    });
  };

  // 댓글 등록
  const [reset, setReset] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>("");
  const [recommentContent, setRecommentContent] = useState<string>("");

  const [commentMentionUser, setCommentMentionUser] = useState<number[]>([]);

  const commentPost = async (commentContent: string, id?: number) => {
    const comment = commentContent.trim();
    const parentId = id;

    if (comment === "") {
      alert("댓글을 입력해 주세요.");
      return;
    }

    if (isUserId === 0) {
      alert("로그인이 필요합니다.");
      return;
    }

    setReset(true);

    const response = await axios.post(`/api/comment/${params.id}`, {
      comment,
      isUserId,
      isUserNick,
      parentId,
      mentionedUserIds: commentMentionUser,
    });

    if (response.data.success) {
      setCommentContent("");
      setRecommentContent("");
      alert(response.data.message);
      setCommentAdd(null);
      setRecommentAdd(null);
      setReset(false);
    }
  };

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
  };

  const commentUpdate = async (recommentContent: string, id: number) => {
    const comment = recommentContent.trim();

    setReset(true);

    const response = await axios.put(`/api/comment/${params.id}`, {
      comment,
      id,
    });

    if (response.data.success) {
      setCommentContent("");
      setRecommentContent("");
      alert(response.data.message);
      setCommentCorrect(null);
      setRecommentCorrect(null);
      setReset(true);
    }
  };

  const commentLike = async (id: number) => {
    if (isUserId === 0) {
      const isConfirmed = confirm("로그인이 필요합니다.");
      if (isConfirmed) {
        router.push("/login");
      } else {
        return;
      }
    }

    await axios.post("/api/comment/action/like", {
      isUserId,
      id,
    });
  };

  const commentReport = async (id: number) => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (!reason) return;

    try {
      const response = await axios.post("/api/user/report", {
        isUserId,
        reportedUserId: id,
        reason,
        type: "comment",
      });
      if (response.data.success) {
        alert("신고가 접수되었습니다.");
      }
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (recommentContent && commentCorrect?.content) {
      setRecommentContent(commentCorrect.content);
    }
  }, [recommentContent]);

  useEffect(() => {
    if (recommentContent && recommentCorrect?.content) {
      setRecommentContent(recommentCorrect.content);
    }
  }, [recommentContent]);

  // writer dropdown
  const { writerDrop, dropPosition, userClick } = useDropDown({ messageToUser });
  const [userInfoInDropMenu, setUserInfoInDropMenu] = useState<{
    userId: number;
    userNickname: string;
  }>({
    userId: 0,
    userNickname: "",
  });

  // user mention
  const extractMentionUsers = () => {
    const userMap = new Map<number, string>();

    if (viewPost && commentList) {
      userMap.set(viewPost.posts.rows[0].user_id, viewPost.posts.rows[0].user_nickname);
      for (const comment of commentList.comments.rows) {
        userMap.set(comment.user_id, comment.user_nickname);
      }
    }

    // 중복 제거된 배열로 변환
    return Array.from(userMap.entries())
      .filter(([id]) => id !== isUserId)
      .map(([id, name]) => ({ id, name }));
  };

  const mentionUsers = extractMentionUsers();

  if (!viewPost) return <div>Loading...</div>;

  return (
    <sub className='sub'>
      {isUserId !== userInfoInDropMenu.userId && writerDrop && (
        <DropDownMenu
          style={{
            top: `${dropPosition.top + 42}px`,
            left: `${dropPosition.left + 14}px`,
          }}
          userInfoInDropMenu={userInfoInDropMenu}
        />
      )}

      <div className='view_page'>
        <div className='view_header'>
          <b className='category'>{viewPost?.posts?.rows?.[0]?.board_name}</b>
          <h4 className='view_title'>{viewPost?.posts?.rows?.[0]?.title}</h4>
          <div className='view_info_area'>
            <div className='view_info'>
              <div className='view_info_left'>
                <div
                  className='writer'
                  onClick={(e) => {
                    userClick(e);
                    setUserInfoInDropMenu({
                      userId: viewPost?.posts?.rows?.[0]?.user_id,
                      userNickname: viewPost?.posts?.rows?.[0]?.user_nickname,
                    });
                  }}>
                  <img
                    className='profile_img'
                    src={viewPost?.posts?.rows?.[0]?.user_profile ?? "/profile/basic.png"}
                    alt={`${viewPost?.posts?.rows?.[0]?.user_nickname}의 프로필`}
                  />
                  <span className='writer_name'>{viewPost?.posts?.rows?.[0]?.user_nickname}</span>
                </div>
              </div>
              <div className='view_info_right'>
                <span className='view flex-start'>
                  <EyeIcon className='icon' />
                  <span>{viewPost?.posts?.rows?.[0]?.views}</span>
                </span>
                <span className='comment flex-start'>
                  <ChatBubbleLeftEllipsisIcon className='icon' />
                  <span>{commentList?.comments?.rows.length}</span>
                </span>
                <span className='like flex-start'>
                  <HeartIcon className='icon' />
                  <span>{viewPost?.posts?.rows?.[0]?.likes}</span>
                </span>
                <span className='date'>{new Date(viewPost?.posts?.rows?.[0]?.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {isUserId !== 0 && isUserId === viewPost?.posts?.rows?.[0]?.user_id && (
              <div className='view_btn'>
                <Link href={`/write/${params.id}`} type='button'>
                  수정
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    postDel();
                  }}>
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        <div className='view_content'>
          <TiptapViewer content={viewPost?.posts?.rows?.[0]?.content} />
        </div>

        {viewPost?.posts?.rows?.[0]?.user_nickname !== isUserNick && (
          <div className='view_content_btn'>
            <button
              type='button'
              onClick={() => {
                postReport();
              }}>
              <FlagIcon className='icon' />
              신고
            </button>
            <button
              type='button'
              onClick={() => {
                postScrap();
              }}>
              스크랩
            </button>
            <button
              className='like_btn'
              type='button'
              onClick={() => {
                postLike();
              }}>
              <HeartIcon className='icon' />
              공감
            </button>
          </div>
        )}

        <div className='view_comment'>
          <div className='comment_top'>
            <b>댓글</b>
            <span className='comment_num'>( {commentList?.comments?.rows.length} )</span>
            {/* <span className="comment_num"><i></i>{viewPost?.posts?.comments}</span> */}
          </div>

          <div className='comment_list'>
            {commentList &&
              commentList?.comments?.rows
                .filter((row) => row.parent_id === null)
                .map((comment: Comments) => (
                  <div key={comment.id} className={`comment_box`} id={`comment-${comment.id}`}>
                    <div className='comment_info'>
                      <div
                        className='writer'
                        onClick={(e) => {
                          userClick(e);
                          setUserInfoInDropMenu({
                            userId: comment.user_id,
                            userNickname: comment.user_nickname,
                          });
                        }}>
                        <img
                          className='profile_img'
                          src={comment.profile ?? "/profile/basic.png"}
                          alt={`${comment.user_nickname}의 프로필`}
                        />
                        <span className='writer_name'>{comment.user_nickname}</span>
                      </div>
                      {isUserId !== null && (
                        <div className='comment_btn'>
                          <button
                            type='button'
                            onClick={() => {
                              if (isUserId === 0) {
                                const isConfirmed = confirm("로그인이 필요합니다.");
                                if (isConfirmed) {
                                  router.push("/login");
                                } else {
                                  return;
                                }
                              }

                              setCommentAdd({ user_id: comment.user_id, id: comment.id });
                              setRecommentAdd(null);
                              setCommentCorrect(null);
                              setRecommentCorrect(null);
                            }}>
                            대댓글
                          </button>
                          {comment.user_id !== isUserId && (
                            <>
                              <button
                                type='button'
                                onClick={() => {
                                  commentLike(comment.id);
                                }}>
                                공감
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  commentReport(comment.user_id);
                                }}>
                                신고
                              </button>
                            </>
                          )}

                          {isUserId === comment.user_id && (
                            <>
                              <button
                                onClick={() => {
                                  setCommentAdd(null);
                                  setRecommentAdd(null);
                                  setRecommentCorrect(null);
                                  setCommentCorrect({ content: comment.content, id: comment.id });
                                }}>
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  commentDelete(comment.id);
                                }}>
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className='comment_content'>
                      <TiptapViewer content={comment.content} key={comment.id + comment.content} />
                      <i className='comment_content_likes'>{comment.likes}</i>
                    </div>

                    {(commentAdd?.user_id !== null && commentAdd?.id === comment.id) ||
                    commentCorrect?.id === comment.id ? (
                      <div className='comment_add re'>
                        <CommentEditor
                          initialContent={commentCorrect ? commentCorrect.content : ""}
                          onChange={(html: string) => setCommentContent(html)}
                          onMentionUsersChange={setCommentMentionUser}
                          users={mentionUsers}
                          reset={reset}
                        />

                        {commentCorrect ? (
                          <button onClick={() => commentUpdate(commentContent, comment.id)}>댓글 수정</button>
                        ) : (
                          <button onClick={() => commentPost(commentContent, comment.id)}>댓글 추가</button>
                        )}
                      </div>
                    ) : null}

                    {commentList?.comments?.rows
                      .filter((row) => row.parent_id === comment.id)
                      .map((recomment: Comments) => (
                        <div key={recomment.id} className={`comment_box re`}>
                          <div className='comment_info'>
                            <div
                              className='writer'
                              onClick={(e) => {
                                userClick(e);
                                setUserInfoInDropMenu({
                                  userId: recomment.user_id,
                                  userNickname: recomment.user_nickname,
                                });
                              }}>
                              <img
                                className='profile_img'
                                src={recomment.profile ?? "/profile/basic.png"}
                                alt={`${recomment.user_nickname}의 프로필`}
                              />
                              <span className='writer_name'>{recomment.user_nickname}</span>
                            </div>
                            {isUserId !== null && (
                              <div className='comment_btn'>
                                {isUserId !== recomment.user_id && (
                                  <>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        if (isUserId === 0) {
                                          const isConfirmed = confirm("로그인이 필요합니다.");
                                          if (isConfirmed) {
                                            router.push("/login");
                                          } else {
                                            return;
                                          }
                                        }

                                        setRecommentAdd({
                                          user_id: recomment.user_id,
                                          id: comment.id,
                                          recomment_id: recomment.id,
                                        });
                                        setCommentAdd(null);
                                        setCommentCorrect(null);
                                        setRecommentCorrect(null);
                                      }}>
                                      대댓글
                                    </button>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        commentLike(recomment.id);
                                      }}>
                                      공감
                                    </button>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        commentReport(recomment.user_id);
                                      }}>
                                      신고
                                    </button>
                                  </>
                                )}

                                {isUserId === recomment.user_id && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setCommentAdd(null);
                                        setRecommentAdd(null);
                                        setCommentCorrect(null);
                                        setRecommentCorrect({
                                          content: recomment.content,
                                          id: comment.id,
                                          recomment_id: recomment.id,
                                        });
                                      }}>
                                      수정
                                    </button>
                                    <button
                                      onClick={() => {
                                        commentDelete(recomment.id);
                                      }}>
                                      삭제
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div className='comment_content'>
                            <TiptapViewer content={recomment.content} key={recomment.id + recomment.content} />
                            <i className='comment_content_likes'>{recomment.likes}</i>
                          </div>

                          {((recommentAdd?.user_id !== null &&
                            recommentAdd?.id === comment.id &&
                            recommentAdd?.recomment_id === recomment.id) ||
                            (recommentCorrect?.id === comment.id &&
                              recommentCorrect?.recomment_id === recomment.id)) && (
                            <div className='comment_add re'>
                              <CommentEditor
                                initialContent={commentCorrect ? commentCorrect.content : ""}
                                onChange={(html: string) => setCommentContent(html)}
                                onMentionUsersChange={setCommentMentionUser}
                                users={mentionUsers}
                                reset={reset}
                              />

                              {recommentCorrect ? (
                                <button
                                  onClick={() => {
                                    commentUpdate(recommentContent, recomment.id);
                                  }}>
                                  댓글 수정
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    commentPost(commentContent, comment.id);
                                  }}>
                                  댓글 추가
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
          </div>
        </div>

        {isUserId !== 0 ? (
          <div className='comment_add'>
            <CommentEditor
              initialContent={commentCorrect ? commentCorrect.content : ""}
              onChange={(html: string) => setCommentContent(html)}
              onMentionUsersChange={setCommentMentionUser}
              users={mentionUsers}
              reset={reset}
            />
            <button
              onClick={() => {
                commentPost(commentContent);
              }}>
              댓글 추가
            </button>
          </div>
        ) : (
          <Link href='/login' className='go_to_login_for_comment'>
            댓글을 입력하려면 로그인 해야합니다.
          </Link>
        )}
      </div>

      <div className='board_top'>
        <select onChange={(e) => setLimit(Number(e.target.value))} value={limit}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
        <div className='btn_wrap btn_wrap_mb0'>
          <Link href={`/board/${params.url_slug}`}>
            <ListBulletIcon className='icon' />
            <span>목록으로</span>
          </Link>
          <Link href={`/write`}>
            <PencilSquareIcon className='icon' />
            <span>글쓰기</span>
          </Link>
        </div>
      </div>

      <Boardlist url_slug={params.url_slug as string} boardType={boardType as string} limit={limit as number} />
    </sub>
  );
}
