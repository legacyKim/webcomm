import { useState } from "react";
import { Member } from "@/type/type";

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";

interface MemberDetailModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

interface MemberPost {
  id: number;
  title: string;
  board_name: string;
  url_slug: string;
  created_at: string;
  views: number;
  likes: number;
}

interface MemberComment {
  id: number;
  content: string;
  post_id: number;
  post_title: string;
  board_name: string;
  url_slug: string;
  created_at: string;
  likes: number;
}

export default function MemberDetailModal({
  member,
  isOpen,
  onClose,
}: MemberDetailModalProps) {
  const [posts, setPosts] = useState<MemberPost[]>([]);
  const [comments, setComments] = useState<MemberComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

  // 회원 게시글/댓글 정보 로드
  const loadMemberData = async () => {
    if (!isOpen || isLoading) return;

    setIsLoading(true);
    try {
      const [postsResponse, commentsResponse] = await Promise.all([
        fetch(`/api/admin/members/${member.id}/posts?limit=5`),
        fetch(`/api/admin/members/${member.id}/comments?limit=5`),
      ]);

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
      }

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error("회원 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 데이터 로드
  useState(() => {
    if (isOpen) {
      loadMemberData();
    }
  });

  // 게시글/댓글 링크 열기
  const openLink = (boardSlug: string, postId: number, commentId?: number) => {
    const url = commentId
      ? `/board/${boardSlug}/${postId}#comment-${commentId}`
      : `/board/${boardSlug}/${postId}`;
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="admin_popup_bg">
      <div className="admin_popup board_view_popup">
        {/* 헤더 */}
        <div className="admin_popup_header">
          <h6>회원 상세 정보</h6>
          <button onClick={onClose}>
            <XMarkIcon className="icon" />
          </button>
        </div>

        {/* 회원 기본 정보 */}
        <div className="admin_popup_content">
          <div className="board_view_header">
            <div className="info_grid"></div>
            <div className="info_item">
              <label htmlFor="">닉네임</label>
              <span>{member.user_nickname}</span>
            </div>
            <div className="info_item">
              <label htmlFor="">이메일</label>
              <span>{member.email}</span>
            </div>
            <div className="info_item">
              <label htmlFor="">권한</label>
              <span>
                {member.authority === 0
                  ? "관리자"
                  : member.authority === 1
                    ? "일반회원"
                    : member.authority === 2
                      ? "경고회원"
                      : "정지회원"}
              </span>
            </div>
            <div className="info_item">
              <label htmlFor="">총 게시물</label>
              <span>{member.all_posts}</span>
            </div>
            <div className="info_item">
              <label htmlFor="">총 조회수</label>
              <span>{member.all_views.toLocaleString()}</span>
            </div>
            <div className="info_item">
              <label htmlFor="">가입일</label>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div
          style={{
            display: "flex",
            marginBottom: "16px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <button
            onClick={() => setActiveTab("posts")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "posts" ? "2px solid #007bff" : "none",
              color: activeTab === "posts" ? "#007bff" : "#666",
              cursor: "pointer",
            }}
          >
            최근 게시글 (5개)
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "comments" ? "2px solid #007bff" : "none",
              color: activeTab === "comments" ? "#007bff" : "#666",
              cursor: "pointer",
            }}
          >
            최근 댓글 (5개)
          </button>
        </div>

        {/* 콘텐츠 */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>로딩 중...</div>
        ) : (
          <div>
            {activeTab === "posts" && (
              <div>
                {posts.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#666",
                      padding: "20px",
                    }}
                  >
                    작성한 게시글이 없습니다.
                  </p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "left",
                          }}
                        >
                          제목
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            width: "100px",
                          }}
                        >
                          게시판
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            width: "80px",
                          }}
                        >
                          조회수
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            width: "60px",
                          }}
                        >
                          좋아요
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            width: "100px",
                          }}
                        >
                          작성일
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id}>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <button
                              onClick={() => openLink(post.url_slug, post.id)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#007bff",
                                cursor: "pointer",
                                textAlign: "left",
                                textDecoration: "underline",
                              }}
                            >
                              {post.title.length > 50
                                ? `${post.title.substring(0, 50)}...`
                                : post.title}
                            </button>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            {post.board_name}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            {post.views}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            {post.likes}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div>
                {comments.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#666",
                      padding: "20px",
                    }}
                  >
                    작성한 댓글이 없습니다.
                  </p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "left",
                          }}
                        >
                          댓글 내용
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "left",
                          }}
                        >
                          게시글
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            width: "60px",
                          }}
                        >
                          좋아요
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            width: "100px",
                          }}
                        >
                          작성일
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map((comment) => (
                        <tr key={comment.id}>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <button
                              onClick={() =>
                                openLink(
                                  comment.url_slug,
                                  comment.post_id,
                                  comment.id
                                )
                              }
                              style={{
                                border: "none",
                                background: "none",
                                color: "#007bff",
                                cursor: "pointer",
                                textAlign: "left",
                                textDecoration: "underline",
                              }}
                            >
                              {comment.content.length > 50
                                ? `${comment.content.substring(0, 50)}...`
                                : comment.content}
                            </button>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <span style={{ color: "#666", fontSize: "12px" }}>
                              [{comment.board_name}]
                            </span>
                            <br />
                            {comment.post_title.length > 30
                              ? `${comment.post_title.substring(0, 30)}...`
                              : comment.post_title}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            {comment.likes}
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            {new Date(comment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
