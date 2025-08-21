"use client";

import axios from "axios";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import TiptapViewer from "@/components/tiptapViewer";
import CommentEditor from "./commentEditor";

import { CommentTreeProps, CommentTreeNode } from "@/type/commentType";
import { PostLiker } from "@/type/type";
import { useCommentResizeObserver } from "@/func/hook/useCommentResizeObserver";

import {
  HeartIcon,
  FlagIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

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

  isCommentLikedByUser,

  // 연타 방지 상태 (상위 컴포넌트에서 전달)
  clickHistory: propClickHistory,
  setClickHistory: propSetClickHistory,
  isRateLimited: propIsRateLimited,
  setIsRateLimited: propSetIsRateLimited,
}: CommentTreeProps) {
  const router = useRouter();

  const { isUserId } = useAuth();

  // 댓글별 좋아요 상태 관리 (낙관적 업데이트용)
  const [commentLikeStates, setCommentLikeStates] = useState<{
    [key: number]: { isLiked: boolean; likeCount: number; likers: PostLiker[] };
  }>({});

  // 연타 방지를 위한 클릭 이력 관리 (사용자별)
  const [localClickHistory, setLocalClickHistory] = useState<number[]>([]);
  const [localIsRateLimited, setLocalIsRateLimited] = useState<number>(0);

  const clickHistory = propClickHistory ?? localClickHistory;
  const setClickHistory = propSetClickHistory ?? setLocalClickHistory;
  const isRateLimited = propIsRateLimited ?? localIsRateLimited;
  const setIsRateLimited = propSetIsRateLimited ?? setLocalIsRateLimited;

  // 댓글 좋아요 상태 확인 함수
  const getCommentLikeStatus = (comment: CommentTreeNode) => {
    const localState = commentLikeStates[comment.id];

    if (localState !== undefined) {
      return localState.isLiked;
    }
    // fallback: 서버 데이터로 확인
    return isCommentLikedByUser ? isCommentLikedByUser(comment) : false;
  };

  // 댓글 좋아요 수 확인 함수
  const getCommentLikeCount = (comment: CommentTreeNode) => {
    const localState = commentLikeStates[comment.id];
    if (localState !== undefined) {
      return localState.likeCount;
    }
    // fallback: 서버 데이터로 확인
    return comment.likes || 0;
  };

  // 초기 댓글 좋아요 상태 설정
  useEffect(() => {
    if (comments) {
      const initialStates: typeof commentLikeStates = {};
      comments.forEach((comment) => {
        const processComment = (c: CommentTreeNode) => {
          // 서버 데이터를 기준으로 실제 좋아요 상태 확인
          const isLikedByServer = isCommentLikedByUser
            ? isCommentLikedByUser(c)
            : false;

          initialStates[c.id] = {
            isLiked: isLikedByServer,
            likeCount: c.likes || 0,
            likers: c.likers || [],
          };
          if (c.children) {
            c.children.forEach(processComment);
          }
        };
        processComment(comment);
      });
      setCommentLikeStates(initialStates);
    }
  }, [comments, isCommentLikedByUser, isUserId]);

  // 연타 제한 해제를 위한 타이머 (최상위 컴포넌트에서만 실행)
  useEffect(() => {
    // props로 연타 방지 상태를 받지 않는 경우에만 타이머 실행 (최상위 컴포넌트)
    if (!propIsRateLimited) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (isRateLimited && now >= isRateLimited) {
          setIsRateLimited(0);
        }
      }, 1000); // 1초마다 체크

      return () => clearInterval(interval);
    }
  }, [isRateLimited, propIsRateLimited, setIsRateLimited]);

  const [recommentCorrect, setRecommentCorrect] = useState<{
    content: string;
    id: number;
    recomment_id: number;
  } | null>(null);

  // 댓글 삭제
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

  // 댓글 수정
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

  // 댓글 좋아요
  const commentLike = async (id: number) => {
    if (isUserId === 0) {
      const isConfirmed = confirm("로그인이 필요합니다.");
      if (isConfirmed) {
        router.push("/login");
      } else {
        return;
      }
    }

    // 현재 시간
    const now = Date.now();

    // 연타 제한 체크 (사용자별 전체 차단)
    if (isRateLimited && now < isRateLimited) {
      const remainingTime = Math.ceil((isRateLimited - now) / 1000);
      alert(`너무 많은 요청입니다. ${remainingTime}초 후에 다시 시도해주세요.`);
      return;
    }

    // 클릭 이력 업데이트 (사용자별)
    const recentClicks = [...clickHistory, now].filter(
      (time) => now - time <= 10000
    ); // 10초 이내 클릭만 유지

    setClickHistory(recentClicks);

    // 10초 안에 10번 이상 클릭했는지 체크
    if (recentClicks.length >= 10) {
      const blockUntil = now + 30000; // 30초 차단
      setIsRateLimited(blockUntil);

      alert("너무 많은 요청이 감지되었습니다. 30초 후에 다시 시도해주세요.");
      return;
    }
    const currentState = commentLikeStates[id];
    if (!currentState) return;

    const wasLiked = currentState.isLiked;
    const newLikeCount = wasLiked
      ? currentState.likeCount - 1
      : currentState.likeCount + 1;

    // 낙관적 업데이트: UI 즉시 변경
    const newLikers: PostLiker[] = wasLiked
      ? currentState.likers.filter((liker) => liker.user_id !== isUserId)
      : [
          ...currentState.likers,
          {
            user_id: isUserId as number,
            user_nickname: "",
            user_profile: "",
            created_at: new Date().toISOString(),
          },
        ];

    setCommentLikeStates((prev) => ({
      ...prev,
      [id]: {
        ...currentState,
        isLiked: !wasLiked,
        likeCount: newLikeCount,
        likers: newLikers,
      },
    }));

    try {
      const response = await axios.post("/api/comment/action/like", {
        isUserId,
        id,
      });

      // 서버 응답으로 정확한 데이터 동기화
      if (response.data.success) {
        setCommentLikeStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            isLiked: response.data.liked, // 서버에서 받은 실제 좋아요 상태
            likers: response.data.likers || [],
            likeCount: response.data.likers
              ? response.data.likers.length
              : response.data.liked
                ? prev[id].likeCount
                : prev[id].likeCount,
          },
        }));
      }
    } catch (error) {
      // 에러 발생 시 롤백
      console.error("댓글 좋아요 실패:", error);
      setCommentLikeStates((prev) => ({
        ...prev,
        [id]: currentState, // 원래 상태로 복원
      }));
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 댓글 신고
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
  const [commentHeights, setCommentHeights] = useState<{
    [key: number]: number;
  }>({});

  useCommentResizeObserver(commentRefs, setCommentHeights, commentList);

  if (!comments) {
    return (
      <div className="data_wait">
        <span>잠시만 기다려 주세요.</span>
        <div className="dots">
          <span className="dot dot1">.</span>
          <span className="dot dot2">.</span>
          <span className="dot dot3">.</span>
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
        const isEditingRecomment =
          recommentCorrect?.recomment_id === comment.id;

        const commentDepth = Number(comment.depth);

        return (
          <div className="comment_box_wrap" key={comment.id}>
            <div
              className={`depth_indicator`}
              style={{
                height: commentHeights[comment.id] ?? 0,
                width: `calc(${commentDepth * 40}px)`,
              }}
            >
              {commentDepth === 1 && (
                <div className="depth_indicator_box">
                  <div className="depth_reply"></div>
                </div>
              )}
              {commentDepth === 2 && (
                <div className="depth_indicator_box">
                  <div className="depth_line"></div>
                  <div className="depth_reply depth2"></div>
                </div>
              )}
              {commentDepth === 3 && (
                <div className="depth_indicator_box">
                  <div className="depth_line"></div>
                  <div className="depth_line depth3"></div>
                  <div className="depth_reply depth3"></div>
                </div>
              )}
            </div>
            <div
              className={`comment_box depth${commentDepth}`}
              id={`comment-${comment.id}`}
              ref={(el) => {
                commentRefs.current[comment.id] = el;
                if (el)
                  el.setAttribute("data-comment-id", comment.id.toString());
              }}
            >
              <div className="comment_box_inner">
                <div className="comment_info">
                  <div
                    className="writer"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      userClick(e);
                      setUserInfoInDropMenu({
                        userId: comment.user_id,
                        userNickname: comment.user_nickname,
                      });
                    }}
                  >
                    <img
                      className="profile_img"
                      src={comment.profile ?? "/profile/basic.png"}
                      alt={`${comment.user_nickname}의 프로필`}
                    />
                    <span className="writer_name">{comment.user_nickname}</span>
                  </div>

                  {isUserId !== null && (
                    <div className="comment_btn">
                      {comment.depth < 3 && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (isUserId === 0) {
                                const isConfirmed =
                                  confirm("로그인이 필요합니다.");
                                if (isConfirmed) {
                                  router.push("/login");
                                }
                                return;
                              }

                              setCommentAdd?.({
                                user_id: comment.user_id,
                                id: comment.id,
                              });
                              setRecommentAdd?.(null);
                              setCommentCorrect(null);
                              setRecommentCorrect(null);
                            }}
                          >
                            <ChatBubbleLeftRightIcon className="icon" />
                            <span>대댓글</span>
                          </button>
                          <div className="ball"></div>
                        </>
                      )}

                      {comment.user_id !== isUserId && (
                        <>
                          <button
                            onClick={() => commentLike(comment.id)}
                            disabled={Boolean(
                              isRateLimited && Date.now() < isRateLimited
                            )}
                            style={{
                              opacity:
                                isRateLimited && Date.now() < isRateLimited
                                  ? 0.6
                                  : 1,
                              cursor:
                                isRateLimited && Date.now() < isRateLimited
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            <HeartIcon className="icon" />
                            <span>
                              {getCommentLikeStatus(comment)
                                ? "공감해제"
                                : "공감"}
                            </span>
                          </button>
                          <div className="ball"></div>
                          <button
                            className="comment_report"
                            onClick={() => commentReport(comment.user_id)}
                          >
                            <FlagIcon className="icon" />
                            <span>신고</span>
                          </button>
                        </>
                      )}

                      {comment.user_id === isUserId && (
                        <>
                          <button
                            onClick={() => {
                              setCommentAdd?.(null);
                              setRecommentAdd?.(null);
                              setCommentCorrect({
                                content: comment.content,
                                id: comment.id,
                              });
                              setRecommentCorrect(null);
                            }}
                          >
                            <span>수정</span>
                          </button>
                          <div className="ball"></div>
                          <button onClick={() => commentDelete(comment.id)}>
                            <span>삭제</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="comment_content">
                  {/* 수정 중이 아닐 때만 댓글 내용 표시 */}
                  {!isEditingComment && (
                    <>
                      <TiptapViewer content={comment.content} />
                      <i className="comment_content_likes">
                        {getCommentLikeCount(comment)}
                      </i>
                    </>
                  )}
                </div>

                {(isWritingComment ||
                  isEditingComment ||
                  isWritingRecomment ||
                  isEditingRecomment) && (
                  <div
                    className={`comment_add ${comment.depth === 1 ? "depth1" : "depth2"}`}
                  >
                    <CommentEditor
                      singleCommentImageFile={singleCommentImageFile}
                      initialContent={
                        isEditingComment || isEditingRecomment
                          ? (commentCorrect?.content ?? "")
                          : ""
                      }
                      onChange={(html: string) =>
                        isRecomment
                          ? setRecommentContent(html)
                          : setCommentContent(html)
                      }
                      onMentionUsersChange={setCommentMentionUser}
                      users={mentionUsers}
                      reset={reset}
                    />
                    <div className="comment_editor">
                      <div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={commentImageUpload}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="image-upload"
                          style={{ cursor: "pointer", marginRight: "10px" }}
                        >
                          <PhotoIcon className="icon" />
                          <span className="notice">
                            용량이 <b className="red">2MB</b> 이하인 이미지만
                            업로드 가능합니다.
                          </span>
                        </label>
                      </div>
                      <div className="btn_wrap">
                        {isEditingComment || isEditingRecomment ? (
                          <button
                            onClick={() =>
                              commentUpdate(
                                isRecomment
                                  ? (recommentContent ?? "")
                                  : (commentContent ?? ""),
                                comment.id
                              )
                            }
                          >
                            댓글 수정
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // 댓글 depth 로직 수정
                              const isReply =
                                comment.parent_id !== null ||
                                commentAdd?.id === comment.id;
                              const newDepth = isReply
                                ? (comment.depth || 0) + 1
                                : 0;

                              commentPost?.(
                                isRecomment
                                  ? (recommentContent ?? "")
                                  : (commentContent ?? ""),
                                comment.parent_id ?? comment.id,
                                newDepth
                              );
                            }}
                          >
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
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 자식 댓글 재귀 렌더링 */}
              {comment.children.length > 0 && (
                <div className="comment_children">
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
                    isCommentLikedByUser={isCommentLikedByUser}
                    // 연타 방지 상태 전달
                    clickHistory={clickHistory}
                    setClickHistory={setClickHistory}
                    isRateLimited={isRateLimited}
                    setIsRateLimited={setIsRateLimited}
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
