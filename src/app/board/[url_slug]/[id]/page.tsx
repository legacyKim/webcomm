"use client";

import axios from "axios";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Boardlist from "@/board/boardlist";

import { useAuth } from "@/AuthContext";
import { useDropDown } from "@/func/hook/useDropDown";
import { useLoginCheck } from "@/func/hook/useLoginCheck";

import DropDownMenu from "@/components/dropDownMenu";
import TiptapViewer from "@/components/tiptapViewer";

import CommentTreeBuild from "./CommentTreeBuild";
import CommentTree from "./CommentTree";

import dynamic from "next/dynamic";
import { SSE_BASE_URL } from "@/lib/sse";

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

import { CommentImage, CommentTreeNode, CommentTreeNodeArr } from "@/type/commentType";

const CommentEditor = dynamic(() => import("./commentEditor"), { ssr: false });

interface Posts {
  posts: {
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
    notice: boolean;
  };
}

interface AppComment {
  id: number;
  parent_id: number | null;
  user_id: number;
  user_nickname: string;
  content: string;
  profile?: string;
  likes: number;
}

export default function View() {
  const params = useParams();
  const router = useRouter();

  const loginCheck = useLoginCheck();

  const { isUserId, isUserNick, messageToUser, boardType } = useAuth();
  const [limit, setLimit] = useState(10);

  const [viewPost, setViewPost] = useState<Posts | null>(null);
  console.log(viewPost);

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
    const eventSource = new EventSource(`${SSE_BASE_URL}/posts/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setViewPost((prev) => {
        if (!prev) return null;

        if (data.id !== prev.posts.id) return prev; // 다른 글이면 무시

        if (data.event === "DELETE") {
          return null; // 글이 삭제된 경우
        }

        if (data.event === "UPDATE") {
          return {
            posts: {
              ...prev.posts,
              likes: data.likes,
              content: data.content,
            },
          };
        }

        // INSERT 이벤트는 단일 post view에서는 무의미하므로 무시
        return prev;
      });
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
    await axios.post("/api/post/action/scrap", {
      isUserId,
      id: params.id,
    });
  };

  // 댓글 기능
  const [commentList, setCommentList] = useState<CommentTreeNodeArr | null>(null);

  // 댓글 실시간 열람
  useEffect(() => {
    const eventSource = new EventSource(`${SSE_BASE_URL}/comments/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as CommentTreeNode & { event: string };

      if (data.event === "INSERT") {
        setCommentList((prev: CommentTreeNodeArr | null) => {
          if (!prev) {
            return { comments: [data] };
          }
          return { comments: [...prev.comments, data] };
        });
      } else if (data.event === "DELETE") {
        setCommentList((prev: CommentTreeNodeArr | null) => {
          if (!prev) return prev;
          return { comments: prev.comments.filter((c) => c.id !== data.id) };
        });
      } else if (data.event === "UPDATE") {
        setCommentList((prev: CommentTreeNodeArr | null) => {
          if (!prev) return prev;
          return {
            comments: prev.comments.map((c) =>
              c.id === data.id ? { ...c, likes: data.likes, content: data.content } : c,
            ),
          };
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // 댓글 트리 구조로 변환
  const rows = commentList?.comments ?? [];
  const commentTree = CommentTreeBuild(rows as AppComment[]);

  // 댓글 내용
  const [commentContent, setCommentContent] = useState<string>("");
  const [recommentContent, setRecommentContent] = useState<string>("");

  // 댓글 수정
  const [commentCorrect, setCommentCorrect] = useState<{ content: string; id: number } | null>(null);

  // 댓글 등록
  const [commentAdd, setCommentAdd] = useState<{ user_id: number; id: number } | null>(null);
  const [recommentAdd, setRecommentAdd] = useState<{ user_id: number; id: number; recomment_id: number } | null>(null);

  // 댓글 등록
  const commentPost = async (commentContent: string, id?: number, depth?: number) => {
    const comment = commentContent.trim();
    const parentId = id;
    const commentDepth = depth ?? null;

    if (comment === "") {
      alert("댓글을 입력해 주세요.");
      return;
    }

    if (isUserId === 0) {
      alert("로그인이 필요합니다.");
      return;
    }

    setReset(true);

    const replaceBlobsWithS3Urls = async (html: string, images: CommentImage[]): Promise<string> => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const imgTags = Array.from(doc.querySelectorAll("img"));

      for (const tag of imgTags) {
        const src = tag.getAttribute("src");
        const match = images.find((img) => img.blobUrl === src);

        if (match) {
          const file = match.file;
          const fileName = encodeURIComponent(file.name);
          const presignedRes = await axios.get(`/api/comment/upload/${fileName}?size=${file.size}`);
          const { url, fileUrl } = presignedRes.data;
          try {
            await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });

            tag.setAttribute("src", fileUrl);
          } catch (err) {
            console.error("이미지 업로드 실패:", err);
            throw new Error("이미지 업로드 중 문제가 발생했습니다.");
          }
        }
      }

      return doc.body.innerHTML;
    };

    try {
      const finalComment = await replaceBlobsWithS3Urls(comment, commentImagesFile);
      const response = await axios.post(`/api/comment/${params.id}`, {
        comment: finalComment,
        isUserId,
        isUserNick,
        parentId,
        mentionedUserIds: commentMentionUser,
        commentDepth,
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
          const isConfirmed = confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
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

  // 에디터 초기화
  const [reset, setReset] = useState<boolean>(false);

  // 댓글 이미지 업로드
  const [commentImagesFile, setCommentImagesFile] = useState<CommentImage[]>([]);
  const [singleCommentImageFile, setSingleCommentImageFile] = useState<string | null>(null);

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
  const { writerDrop, dropPosition, userClick } = useDropDown({ messageToUser });
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
      userMap.set(viewPost?.posts?.user_id, viewPost?.posts?.user_nickname);
      for (const comment of commentList.comments) {
        userMap.set(comment.user_id, comment.user_nickname);
      }
    }

    // 중복 제거된 배열로 변환
    return Array.from(userMap.entries())
      .filter(([id]) => id !== isUserId)
      .map(([id, name]) => ({ id, name }));
  };

  const mentionUsers = extractMentionUsers();

  if (!viewPost)
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

  return (
    <sub className='sub'>
      {isUserId !== userInfoInDropMenu.userId && writerDrop && (
        <DropDownMenu
          style={{
            top: `${dropPosition.top}px`,
            left: `${dropPosition.left + (writerRef.current?.offsetWidth ?? 0) + 8}px`,
          }}
          userInfoInDropMenu={userInfoInDropMenu}
        />
      )}

      <div className='view_page'>
        <div className='view_header'>
          <b className='category'>{viewPost?.posts?.board_name}</b>
          <h4 className='view_title'>{viewPost?.posts?.title}</h4>
          <div className='view_info_area'>
            <div className='view_info'>
              <div className='view_info_left'>
                <div
                  className='writer'
                  ref={writerRef}
                  onClick={async (e) => {
                    const ok = await loginCheck();
                    if (!ok) return;

                    userClick(e);
                    setUserInfoInDropMenu({
                      userId: viewPost?.posts?.user_id,
                      userNickname: viewPost?.posts?.user_nickname,
                    });
                  }}>
                  <img
                    className='profile_img'
                    src={viewPost?.posts?.user_profile ?? "/profile/basic.png"}
                    alt={`${viewPost?.posts?.user_nickname}의 프로필`}
                  />
                  <span className='writer_name'>{viewPost?.posts?.user_nickname}</span>
                </div>
              </div>
              <div className='view_info_right'>
                <span className='view flex-start'>
                  <EyeIcon className='icon' />
                  <span>{viewPost?.posts?.views}</span>
                </span>
                <span className='comment flex-start'>
                  <ChatBubbleLeftEllipsisIcon className='icon' />
                  <span>{commentList?.comments?.length}</span>
                </span>
                <span className='like flex-start'>
                  <HeartIcon className='icon' />
                  <span>{viewPost?.posts?.likes}</span>
                </span>
                <div className='bar'></div>
                <span className='date'>{new Date(viewPost?.posts?.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {isUserId !== 0 && isUserId === viewPost?.posts?.user_id && (
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
          <TiptapViewer content={viewPost?.posts?.content} />
        </div>

        {viewPost?.posts?.user_nickname !== isUserNick && (
          <div className='view_content_btn'>
            {!viewPost?.posts?.notice && (
              <button
                type='button'
                onClick={async () => {
                  const ok = await loginCheck();
                  if (!ok) return;

                  postReport();
                }}>
                <FlagIcon className='icon' />
                신고
              </button>
            )}

            <button
              style={{ display: "none" }} // 스크랩 기능은 현재 준비 중이므로 숨김 처리
              type='button'
              onClick={async () => {
                const ok = await loginCheck();
                if (!ok) return;

                postScrap();
              }}>
              스크랩
            </button>
            <button
              className='like_btn'
              type='button'
              onClick={async () => {
                const ok = await loginCheck();
                if (!ok) return;

                postLike();
              }}>
              <HeartIcon className='icon' />
              공감
            </button>
          </div>
        )}

        <div className='view_comment'>
          <div className='comment_top'>
            <ChatBubbleLeftRightIcon className='icon' />
            <b>댓글</b>
            <span className='comment_num'> {commentList?.comments?.length} </span>
            {/* <span className="comment_num"><i></i>{viewPost?.posts?.comments}</span> */}
          </div>

          <div className='comment_list'>
            <CommentTree
              params={{
                id: params.id as string,
                url_slug: params.url_slug as string,
              }}
              router={router}
              comments={commentTree}
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
        </div>

        {isUserId !== 0 ? (
          <div className='comment_add'>
            <CommentEditor
              singleCommentImageFile={singleCommentImageFile}
              initialContent={commentCorrect ? commentCorrect.content : ""}
              onChange={(html: string) => setCommentContent(html)}
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
                    용량이 <b className='red'>2MB</b> 이하인 이미지만 업로드 가능합니다.{" "}
                  </span>
                </label>
              </div>

              <div className='btn_wrap'>
                <button
                  onClick={() => {
                    commentPost(commentContent);
                  }}>
                  댓글 추가
                </button>
              </div>
            </div>
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
          {isUserId !== null && (
            <Link href={`/write`}>
              <PencilSquareIcon className='icon' />
              <span>글쓰기</span>
            </Link>
          )}
        </div>
      </div>

      <Boardlist url_slug={params.url_slug as string} boardType={boardType as string} limit={limit as number} />
    </sub>
  );
}
