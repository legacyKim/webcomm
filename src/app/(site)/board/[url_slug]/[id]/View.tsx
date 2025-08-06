"use client";

import axios from "axios";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Boardlist from "@/(site)/board/boardlist";

import { useAuth } from "@/contexts/AuthContext";
import { useDropDown } from "@/func/hook/useDropDown";
import { useLoginCheck } from "@/func/hook/useLoginCheck";
import { usePathname } from "next/navigation";

import DropDownMenu from "@/components/dropDownMenu";
import TiptapViewer from "@/components/tiptapViewer";

import { CommentTreeBuild } from "./CommentTreeBuild";
import CommentTree from "./CommentTree";
import { SSE_BASE_URL } from "@/lib/sse";

import { Posts, PostLiker, initDataPosts } from "@/type/type";

import dynamic from "next/dynamic";

import {
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  HeartIcon,
  ListBulletIcon,
  PencilSquareIcon,
  FlagIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

import { CommentImage, CommentTreeNode } from "@/type/commentType";

const CommentEditor = dynamic(() => import("./commentEditor"), { ssr: false });

export default function View({
  post,
  comment,
  page,
}: {
  post: Posts;
  comment: CommentTreeNode[] | null;
  page: number;
}) {
  const pathname = usePathname();

  useEffect(() => {
    setRedirectPath(pathname);
  }, []);

  const params = useParams();
  const router = useRouter();

  const loginCheck = useLoginCheck();

  const {
    isUserId,
    isUserNick,
    messageToUser,
    boardType,
    setRedirectPath,
    initData,
  } = useAuth();
  // const [limit, setLimit] = useState(10);

  const [viewPost] = useState<Posts | null>(post);

  // 좋아요 상태 관리 (SSR 데이터 활용)
  const [isLiked, setIsLiked] = useState<boolean>(
    post?.is_liked_by_user || false
  );
  const [likeCount, setLikeCount] = useState<number>(post?.likes || 0);
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);

  // 좋아요한 사용자 목록
  const [likers, setLikers] = useState<PostLiker[]>(post?.likers || []);
  const [showLikers, setShowLikers] = useState(false);

  // 댓글별 좋아요한 사용자 목록
  const [commentLikers, setCommentLikers] = useState<{ [key: number]: any[] }>(
    {}
  );

  // SSR 데이터가 변경되면 상태 업데이트
  useEffect(() => {
    if (post) {
      setIsLiked(post.is_liked_by_user || false);
      setLikeCount(post.likes || 0);
      setLikers(post.likers || []);
    }

    // 댓글별 좋아요 사용자 정보 초기화
    if (comment) {
      const initialCommentLikers: { [key: number]: any[] } = {};
      comment.forEach((c: any) => {
        if (c.likers) {
          initialCommentLikers[c.id] = c.likers;
        }
      });
      setCommentLikers(initialCommentLikers);
    }
  }, [post, comment]);

  // 게시물 삭제
  const postDel = async () => {
    const isConfirmed = confirm("삭제하시겠습니까?");
    if (isConfirmed) {
      try {
        const res = await axios.post(
          `/api/post/${params.url_slug}/${params.id}`
        );

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
    if (isLikeLoading) return; // 중복 클릭 방지

    setIsLikeLoading(true);

    // 낙관적 업데이트
    const wasLiked = isLiked;
    const prevLikeCount = likeCount;
    const prevLikers = [...likers];

    setIsLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    // 좋아요 사용자 목록 낙관적 업데이트
    if (!wasLiked) {
      // 좋아요 추가 - 현재 사용자를 목록에 추가
      setLikers((prev) => [
        {
          user_id: isUserId!,
          user_nickname: isUserNick!,
          user_profile: undefined,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      // 좋아요 취소 - 현재 사용자를 목록에서 제거
      setLikers((prev) => prev.filter((liker) => liker.user_id !== isUserId));
    }

    try {
      const response = await axios.post("/api/post/action/like", {
        isUserId,
        id: params.id,
      });

      if (response.data.success) {
        // 서버 응답과 동기화
        setIsLiked(response.data.liked);

        // 최신 좋아요 사용자 목록을 서버에서 다시 가져오기
        try {
          const detailResponse = await axios.get(
            `/api/post/${params.url_slug}/${params.id}?userId=${isUserId}`
          );
          if (detailResponse.data.response && detailResponse.data.post) {
            setLikers(detailResponse.data.post.likers || []);
            setLikeCount(detailResponse.data.post.likes || 0);
          }
        } catch (fetchError) {
          console.error("좋아요 목록 새로고침 실패:", fetchError);
        }
      } else {
        // 실패 시 원래 상태로 롤백
        setIsLiked(wasLiked);
        setLikeCount(prevLikeCount);
        setLikers(prevLikers);
        console.error("좋아요 처리 실패:", response.data.error);
      }
    } catch (error) {
      // 에러 시 원래 상태로 롤백
      setIsLiked(wasLiked);
      setLikeCount(prevLikeCount);
      setLikers(prevLikers);
      console.error("좋아요 요청 실패:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // 댓글 좋아요
  const commentLike = async (commentId: number) => {
    try {
      const response = await axios.post("/api/comment/action/like", {
        isUserId,
        id: commentId,
      });

      if (response.data.success) {
        // 댓글 목록 새로고침 대신 해당 댓글의 좋아요 정보만 업데이트
        try {
          const detailResponse = await axios.get(
            `/api/post/${params.url_slug}/${params.id}?userId=${isUserId}`
          );
          if (detailResponse.data.response && detailResponse.data.comments) {
            // 댓글별 좋아요 사용자 정보 업데이트
            const updatedCommentLikers: { [key: number]: any[] } = {};
            detailResponse.data.comments.forEach((c: any) => {
              if (c.likers) {
                updatedCommentLikers[c.id] = c.likers;
              }
            });
            setCommentLikers(updatedCommentLikers);

            // 댓글 목록도 업데이트 (좋아요 수 반영)
            setCommentList(detailResponse.data.comments);
          }
        } catch (fetchError) {
          console.error("댓글 좋아요 목록 새로고침 실패:", fetchError);
          // 실패 시 페이지 새로고침
          location.reload();
        }
      } else {
        console.error("댓글 좋아요 처리 실패:", response.data.error);
      }
    } catch (error) {
      console.error("댓글 좋아요 요청 실패:", error);
    }
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
    await axios.post("/api/post/action/scrap", {
      isUserId,
      id: params.id,
    });
  };

  // 댓글 기능
  const [commentList, setCommentList] = useState<CommentTreeNode[] | null>(
    comment ?? []
  );

  // 댓글 실시간 열람
  useEffect(() => {
    const eventSource = new EventSource(`${SSE_BASE_URL}/comments/stream`);

    eventSource.onerror = (error) => {
      console.error("SSE 연결 오류:", error);
    };

    console.log("SSE 연결 성공");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as CommentTreeNode & {
          event: string;
          post_id: string;
        };

        console.log(data, "?????");
        console.log("현재 post_id:", params.id, "타입:", typeof params.id);
        console.log(
          "받은 post_id:",
          data.post_id,
          "타입:",
          typeof data.post_id
        );

        // 연결 확인 메시지는 무시
        if (data.event === "connected") {
          console.log("연결 확인 메시지 - 무시됨");
          return;
        }

        // 현재 게시글이 아닌 댓글은 무시
        const currentPostId = parseInt(params.id as string);
        const receivedPostId =
          typeof data.post_id === "string"
            ? parseInt(data.post_id)
            : data.post_id;

        if (receivedPostId !== currentPostId) {
          console.log("post_id 불일치로 무시됨", {
            receivedPostId,
            currentPostId,
          });
          return;
        }

        console.log("post_id 일치! 댓글 처리 시작");

        if (data.event === "INSERT") {
          console.log("INSERT 이벤트 처리 중...");
          setCommentList((prev: CommentTreeNode[] | null) => {
            console.log("이전 댓글 목록:", prev);

            // 누락된 필드들 추가
            const newComment: CommentTreeNode = {
              id: data.id,
              parent_id: data.parent_id || null,
              user_id: data.user_id,
              user_nickname: data.user_nickname,
              content: data.content,
              profile: data.profile,
              likes: data.likes || 0,
              depth: data.depth || 0,
              created_at: data.created_at,
              updated_at: data.updated_at,
              event: data.event,
              post_id: data.post_id,
              children: [],
            };

            console.log("새 댓글 객체:", newComment);

            if (!prev) {
              console.log("이전 댓글이 없음, 새 댓글만 반환");
              return [newComment];
            }

            const updatedList = [...prev, newComment];
            console.log("업데이트된 댓글 목록:", updatedList);
            return updatedList;
          });
        } else if (data.event === "DELETE") {
          setCommentList((prev: CommentTreeNode[] | null) => {
            if (!prev) return prev;
            return prev.filter((c) => c.id !== data.id);
          });
        } else if (data.event === "UPDATE") {
          setCommentList((prev: CommentTreeNode[] | null) => {
            if (!prev) return prev;
            return prev.map((c) =>
              c.id === data.id
                ? { ...c, likes: data.likes, content: data.content }
                : c
            );
          });
        }
      } catch (error) {
        console.error("JSON 파싱 오류:", error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // 댓글 트리 구조로 변환 - useMemo로 최적화
  const commentTree = useMemo(() => {
    const rows = commentList ?? [];
    console.log("commentTree 재계산 중, commentList:", rows);
    return CommentTreeBuild(rows);
  }, [commentList]);

  // 댓글 내용
  const [commentContent, setCommentContent] = useState<string>("");
  const [recommentContent, setRecommentContent] = useState<string>("");

  // 댓글 수정
  const [commentCorrect, setCommentCorrect] = useState<{
    content: string;
    id: number;
  } | null>(null);

  // 댓글 등록
  const [commentAdd, setCommentAdd] = useState<{
    user_id: number;
    id: number;
  } | null>(null);
  const [recommentAdd, setRecommentAdd] = useState<{
    user_id: number;
    id: number;
    recomment_id: number;
  } | null>(null);

  // 댓글 등록
  const commentPost = async (
    commentContent: string,
    id?: number,
    depth?: number | null
  ) => {
    console.log("댓글 등록 요청:", {
      content: commentContent,
      parentId: id,
      depth: depth,
    });

    const comment = commentContent.trim();
    const parentId = id;
    // depth가 명시적으로 전달되지 않은 경우 최상위 댓글(0)으로 처리
    const commentDepth = depth !== null && depth !== undefined ? depth : 0;

    console.log("최종 commentDepth:", commentDepth);

    if (comment === "") {
      alert("댓글을 입력해 주세요.");
      return;
    }

    if (isUserId === 0) {
      alert("로그인이 필요합니다.");
      return;
    }

    setReset(true);

    try {
      // FormData로 댓글과 이미지를 함께 전송
      const formData = new FormData();
      formData.append("comment", comment);
      formData.append("isUserId", (isUserId || 0).toString());
      formData.append("isUserNick", isUserNick || "");
      formData.append("parentId", parentId ? parentId.toString() : "");
      formData.append("mentionedUserIds", JSON.stringify(commentMentionUser));
      formData.append("commentDepth", commentDepth.toString());

      // 이미지 파일이 있는 경우 base64로 변환하여 전송
      if (commentImagesFile.length > 0) {
        const imageFilesData = await Promise.all(
          commentImagesFile.map(async (img) => {
            const base64 = await fileToBase64(img.file);
            return {
              name: img.file.name,
              type: img.file.type,
              data: base64.split(",")[1], // data:image/... 부분 제거
              blobUrl: img.blobUrl,
            };
          })
        );
        formData.append("imageFiles", JSON.stringify(imageFilesData));
      }

      const response = await axios.post(`/api/comment/${params.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setCommentContent("");
        setRecommentContent("");
        alert(response.data.message);
        setCommentAdd(null);
        setRecommentAdd(null);
        setCommentImagesFile([]);
        if (setSingleCommentImageFile) {
          setSingleCommentImageFile(null);
        }
        setReset(false);
      } else {
        if (response.data.message === "인증되지 않은 사용자입니다.") {
          const isConfirmed = confirm(
            "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
          );
          if (isConfirmed) {
            router.push("/login");
          }
          return;
        } else {
          alert(response.data.message || "댓글 등록에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // 파일을 base64로 변환하는 헬퍼 함수
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 에디터 초기화
  const [reset, setReset] = useState<boolean>(false);

  // 댓글 이미지 업로드
  const [commentImagesFile, setCommentImagesFile] = useState<CommentImage[]>(
    []
  );
  const [singleCommentImageFile, setSingleCommentImageFile] = useState<
    string | null
  >(null);

  const commentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("최대 2MB 이하의 이미지만 업로드 가능합니다.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setSingleCommentImageFile(blobUrl);
    setCommentImagesFile((prev) => [...prev, { file, blobUrl }]);
  };

  // writer dropdown
  const writerRef = useRef<HTMLDivElement>(null);
  const { writerDrop, dropPosition, userClick } = useDropDown({
    messageToUser,
  });
  const [userInfoInDropMenu, setUserInfoInDropMenu] = useState<{
    userId: number;
    userNickname: string;
  }>({
    userId: 0,
    userNickname: "",
  });

  // user mention
  const [commentMentionUser, setCommentMentionUser] = useState<number[]>([]);

  const extractMentionUsers = () => {
    const userMap = new Map<number, string>();

    if (viewPost && commentList) {
      userMap.set(viewPost?.user_id, viewPost?.user_nickname);
      for (const comment of commentList) {
        userMap.set(comment.user_id, comment.user_nickname);
      }
    }

    // 중복 제거된 배열로 변환
    return Array.from(userMap.entries())
      .filter(([id]) => id !== isUserId)
      .map(([id, name]) => ({ id, name }));
  };

  const mentionUsers = extractMentionUsers();

  // 게시물 좋아요 사용자 목록 가져오기
  const getPostLikers = () => likers;

  // 댓글 좋아요 사용자 목록 가져오기
  const getCommentLikers = (commentId: number) =>
    commentLikers[commentId] || [];

  if (!viewPost)
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

  return (
    <sub className="sub">
      {isUserId !== userInfoInDropMenu.userId && writerDrop && (
        <DropDownMenu
          style={{
            top: `${dropPosition.top + (writerRef.current?.offsetHeight ?? 0) / 2}px`,
            left: `${dropPosition.left + (writerRef.current?.offsetWidth ?? 0) / 2}px`,
          }}
          userInfoInDropMenu={userInfoInDropMenu}
        />
      )}

      <div className="view_page">
        <div className="view_header">
          <b className="category">{viewPost?.board_name}</b>
          <h4 className="view_title">{viewPost?.title}</h4>
          <div className="view_info_area">
            <div className="view_info">
              <div className="view_info_left">
                <div
                  className="writer"
                  ref={writerRef}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    userClick(e);
                    setUserInfoInDropMenu({
                      userId: viewPost?.user_id,
                      userNickname: viewPost?.user_nickname,
                    });
                  }}
                >
                  <img
                    className="profile_img"
                    src={viewPost?.user_profile ?? "/profile/basic.png"}
                    alt={`${viewPost?.user_nickname}의 프로필`}
                  />
                  <span className="writer_name">{viewPost?.user_nickname}</span>
                </div>
              </div>
              <div className="view_info_right">
                <span className="view flex-start">
                  <EyeIcon className="icon" />
                  <span>{viewPost?.views}</span>
                </span>
                <span className="comment flex-start">
                  <ChatBubbleLeftEllipsisIcon className="icon" />
                  <span>{commentList?.length}</span>
                </span>
                <span className="like flex-start">
                  <HeartIcon className="icon" />
                  <span>{viewPost?.likes}</span>
                </span>
                <span className="date">
                  {new Date(viewPost?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isUserId !== 0 && isUserId === viewPost?.user_id && (
              <div className="view_btn">
                <Link href={`/write/${params.id}`} type="button">
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    postDel();
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="view_content">
          <TiptapViewer content={viewPost?.content} />
        </div>

        {isUserId && viewPost?.user_nickname !== isUserNick && (
          <div className="view_content_btn">
            {!viewPost?.notice && (
              <button
                type="button"
                onClick={async () => {
                  const ok = await loginCheck();
                  if (!ok) return;

                  postReport();
                }}
              >
                <FlagIcon className="icon" />
                신고
              </button>
            )}

            <button
              style={{ display: "none" }}
              type="button"
              onClick={async () => {
                const ok = await loginCheck();
                if (!ok) return;

                postScrap();
              }}
            >
              스크랩
            </button>
            <button
              className={`like_btn ${isLiked ? "liked" : ""}`}
              type="button"
              disabled={isLikeLoading}
              onClick={async () => {
                const ok = await loginCheck();
                if (!ok) return;

                postLike();
              }}
              style={{
                color: isLiked ? "#ff4757" : "inherit",
                opacity: isLikeLoading ? 0.6 : 1,
              }}
            >
              <HeartIcon
                className="icon"
                style={{
                  fill: isLiked ? "#ff4757" : "none",
                  stroke: isLiked ? "#ff4757" : "currentColor",
                }}
              />
              공감 {likeCount > 0 && `(${likeCount})`}
            </button>
          </div>
        )}

        <div className="view_comment">
          <div className="comment_top">
            <ChatBubbleLeftRightIcon className="icon" />
            <b>댓글</b>
            <span className="comment_num"> {commentList?.length} </span>
            {/* <span className="comment_num"><i></i>{viewPost?.comments}</span> */}
          </div>

          <div className="comment_list">
            <CommentTree
              params={{
                id: params.id as string,
                url_slug: params.url_slug as string,
              }}
              comments={commentTree}
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
              commentLike={commentLike}
              commentLikers={commentLikers}
            />
          </div>
        </div>

        {isUserId !== null ? (
          commentAdd === null ? (
            <div className="comment_add">
              <b>댓글 작성</b>
              <CommentEditor
                singleCommentImageFile={singleCommentImageFile}
                initialContent={commentCorrect ? commentCorrect.content : ""}
                onChange={(html: string) => setCommentContent(html)}
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
                      용량이 <b className="red">2MB</b> 이하인 이미지만 업로드
                      가능합니다.{" "}
                    </span>
                  </label>
                </div>

                <div className="btn_wrap">
                  <button
                    onClick={() => {
                      commentPost(commentContent);
                    }}
                  >
                    댓글 추가
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )
        ) : (
          <Link href="/login" className="go_to_login_for_comment">
            댓글을 입력하려면 로그인 해야합니다.
          </Link>
        )}
      </div>

      <div className="board_top">
        {/* {isUserId !== null && (
          <select onChange={(e) => setLimit(Number(e.target.value))} value={limit}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        )} */}
        <div></div>
        <div className="btn_wrap btn_wrap_mb0">
          <Link href={`/board/${params.url_slug}`}>
            <ListBulletIcon className="icon" />
            <span>목록으로</span>
          </Link>
          {isUserId !== null && (
            <Link href={`/write`}>
              <PencilSquareIcon className="icon" />
              <span>글쓰기</span>
            </Link>
          )}
        </div>
      </div>

      <Boardlist
        url_slug={params.url_slug as string}
        page={page}
        boardType={boardType as string}
        limit={20 as number}
        initData={initData as initDataPosts}
      />
    </sub>
  );
}
