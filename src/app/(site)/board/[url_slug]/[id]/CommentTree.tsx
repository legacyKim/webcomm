"use client";

import axios from "axios";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/AuthContext";
import TiptapViewer from "@/components/tiptapViewer";
import CommentEditor from "./commentEditor";

import { CommentTreeProps } from "@/type/commentType";
import { useCommentResizeObserver } from "@/func/hook/useCommentResizeObserver";

import { HeartIcon, FlagIcon, PhotoIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function CommentTree({
  params,

  comments,
  commentList,
  setCommentList,

  loginCheck,
  userClick,
  setUserInfoInDropMenu,

  mentionUsers,
  setCommentMentionUser,

  singleCommentImageFile,
  setSingleCommentImageFile,

  commentImageUpload,
  setCommentImagesFile,

  commentContent,
  setCommentContent,
  recommentContent,
  setRecommentContent,

  reset,
  setReset,

  commentAdd,
  setCommentAdd,
  recommentAdd,
  setRecommentAdd,

  commentPost,

  commentCorrect,
  setCommentCorrect,
}: CommentTreeProps) {
  const router = useRouter();

  const { isUserId } = useAuth();

  const [recommentCorrect, setRecommentCorrect] = useState<{
    content: string;
    id: number;
    recomment_id: number;
  } | null>(null);

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

  // 댓글 높이 계산을 위한 ref 설정
  const commentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [commentHeights, setCommentHeights] = useState<{ [key: number]: number }>({});

  useCommentResizeObserver(commentRefs, setCommentHeights, commentList);

  if (!comments) {
    return (
      <div className='data_wait'>
        <span>잠시만 기다려 주세요.</span>
        <div className='dots'>
          <span className='dot dot1'>.</span>
          <span className='dot dot2'>.</span>
          <span className='dot dot3'>.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {comments.map((comment) => {
        const isRecomment = comment.parent_id !== null;

        const isWritingComment = commentAdd?.id === comment.id;
        const isEditingComment = commentCorrect?.id === comment.id;

        const isWritingRecomment =
          recommentAdd?.recomment_id === comment.id ||
          (recommentAdd?.id === comment.id && comment.children.length === 0);
        const isEditingRecomment = recommentCorrect?.recomment_id === comment.id;

        const commentDepth = Number(comment.depth);

        return (
          <div className='comment_box_wrap' key={comment.id}>
            <div
              className={`depth_indicator`}
              style={{
                height: commentHeights[comment.id] ?? 0,
                width: `calc(${commentDepth * 40}px)`,
              }}>
              {commentDepth === 1 && (
                <div className='depth_indicator_box'>
                  <div className='depth_reply'></div>
                </div>
              )}
              {commentDepth === 2 && (
                <div className='depth_indicator_box'>
                  <div className='depth_line'></div>
                  <div className='depth_reply depth2'></div>
                </div>
              )}
              {commentDepth === 3 && (
                <div className='depth_indicator_box'>
                  <div className='depth_line'></div>
                  <div className='depth_line depth3'></div>
                  <div className='depth_reply depth3'></div>
                </div>
              )}
            </div>
            <div
              className={`comment_box depth${commentDepth}`}
              id={`comment-${comment.id}`}
              ref={(el) => {
                commentRefs.current[comment.id] = el;
                if (el) el.setAttribute("data-comment-id", comment.id.toString());
              }}>
              <div className='comment_box_inner'>
                <div className='comment_info'>
                  <div
                    className='writer'
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
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
                      {comment.depth < 3 && (
                        <button
                          type='button'
                          onClick={() => {
                            if (isUserId === 0) {
                              const isConfirmed = confirm("로그인이 필요합니다.");
                              if (isConfirmed) {
                                router.push("/login");
                              }
                              return;
                            }

                            setCommentAdd?.({ user_id: comment.user_id, id: comment.id });
                            setRecommentAdd?.(null);
                            setCommentCorrect(null);
                            setRecommentCorrect(null);
                          }}>
                          <ChatBubbleLeftRightIcon className='icon' />
                          <span>대댓글</span>
                        </button>
                      )}

                      {comment.user_id !== isUserId && (
                        <>
                          {comment.depth < 3 && <div className='ball'></div>}
                          <button onClick={() => commentLike(comment.id)}>
                            <HeartIcon className='icon' />
                            <span>공감</span>
                          </button>
                          <div className='ball'></div>
                          <button className='comment_report' onClick={() => commentReport(comment.user_id)}>
                            <FlagIcon className='icon' />
                            <span>신고</span>
                          </button>
                        </>
                      )}

                      {comment.user_id === isUserId && (
                        <>
                          <div className='ball'></div>
                          <button
                            onClick={() => {
                              setCommentAdd?.(null);
                              setRecommentAdd?.(null);
                              setCommentCorrect({
                                content: comment.content,
                                id: comment.id,
                              });
                              setRecommentCorrect(null);
                            }}>
                            <span>수정</span>
                          </button>
                          <div className='ball'></div>
                          <button onClick={() => commentDelete(comment.id)}>
                            <span>삭제</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className='comment_content'>
                  <TiptapViewer content={comment.content} />
                  <i className='comment_content_likes'>{comment.likes}</i>
                </div>

                {(isWritingComment || isEditingComment || isWritingRecomment || isEditingRecomment) && (
                  <div className={`comment_add ${comment.depth === 1 ? "depth1" : "depth2"}`}>
                    <CommentEditor
                      singleCommentImageFile={singleCommentImageFile}
                      initialContent={isEditingComment || isEditingRecomment ? commentCorrect?.content ?? "" : ""}
                      onChange={(html: string) => (isRecomment ? setRecommentContent(html) : setCommentContent(html))}
                      onMentionUsersChange={setCommentMentionUser}
                      users={mentionUsers}
                      reset={reset}
                    />
                    <div className='comment_editor'>
                      <div>
                        <input
                          id='image-upload'
                          type='file'
                          accept='image/*'
                          onChange={commentImageUpload}
                          style={{ display: "none" }}
                        />
                        <label htmlFor='image-upload' style={{ cursor: "pointer", marginRight: "10px" }}>
                          <PhotoIcon className='icon' />
                          <span className='notice'>
                            용량이 <b className='red'>2MB</b> 이하인 이미지만 업로드 가능합니다.
                          </span>
                        </label>
                      </div>
                      <div className='btn_wrap'>
                        {isEditingComment || isEditingRecomment ? (
                          <button
                            onClick={() =>
                              commentUpdate(isRecomment ? recommentContent ?? "" : commentContent ?? "", comment.id)
                            }>
                            댓글 수정
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              commentPost?.(
                                isRecomment ? recommentContent ?? "" : commentContent ?? "",
                                comment.parent_id ?? comment.id,
                                comment.depth,
                              )
                            }>
                            댓글 추가
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCommentAdd?.(null);
                            setRecommentAdd?.(null);
                            setCommentCorrect(null);
                            setRecommentCorrect(null);
                            setCommentContent("");
                            setRecommentContent("");
                            setReset(true);
                          }}>
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 자식 댓글 재귀 렌더링 */}
              {comment.children.length > 0 && (
                <div className='comment_children'>
                  <CommentTree
                    params={{
                      id: params.id as string,
                      url_slug: params.url_slug as string,
                    }}
                    comments={comment.children}
                    commentList={commentList}
                    setCommentList={setCommentList}
                    loginCheck={loginCheck}
                    userClick={userClick}
                    setUserInfoInDropMenu={setUserInfoInDropMenu}
                    mentionUsers={mentionUsers}
                    setCommentMentionUser={setCommentMentionUser}
                    singleCommentImageFile={singleCommentImageFile}
                    setSingleCommentImageFile={setSingleCommentImageFile}
                    commentImageUpload={commentImageUpload}
                    setCommentImagesFile={setCommentImagesFile}
                    commentContent={commentContent}
                    setCommentContent={setCommentContent}
                    recommentContent={recommentContent}
                    setRecommentContent={setRecommentContent}
                    reset={reset}
                    setReset={setReset}
                    commentAdd={commentAdd}
                    setCommentAdd={setCommentAdd}
                    recommentAdd={recommentAdd}
                    setRecommentAdd={setRecommentAdd}
                    commentPost={commentPost}
                    commentCorrect={commentCorrect}
                    setCommentCorrect={setCommentCorrect}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
