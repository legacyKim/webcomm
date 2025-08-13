"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TiptapViewer from "@/components/tiptapViewer";
import CountUpAnimation from "@/components/CountUpAnimation";

import { UserProfile, UserActivity } from "@/type/type";

import { EyeIcon, HeartIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
// 타입 정의

interface ProfileProps {
  userProfile?: UserProfile | null;
  userActivity?: UserActivity | null;
  currentTab?: "summary" | "posts" | "comments" | "likes" | "follower";
  isLoading?: boolean;
}

export default function Profile({
  userProfile,
  userActivity,
  currentTab,
  isLoading = false,
}: ProfileProps) {
  const { isUserId } = useAuth();

  const [isFollowing, setIsFollowing] = useState(
    userProfile?.isFollowing || false
  );
  const [followerCount, setFollowerCount] = useState(
    userProfile?.follower_count || 0
  );
  const [activeTab, setActiveTab] = useState<
    "summary" | "posts" | "comments" | "likes" | "follower"
  >(currentTab ?? "summary");

  // 서버에서 받은 팔로우 상태로 초기화
  useEffect(() => {
    if (userProfile?.isFollowing !== undefined) {
      setIsFollowing(userProfile.isFollowing);
    }
    if (userProfile?.follower_count !== undefined) {
      setFollowerCount(userProfile.follower_count);
    }
  }, [userProfile?.isFollowing, userProfile?.follower_count]);

  // 팔로우/언팔로우 핸들러
  const handleFollowToggle = async () => {
    if (!userProfile) {
      console.error("사용자 프로필을 찾을 수 없습니다.");
      return;
    }

    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    // 낙관적 업데이트
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));

    try {
      const response = await fetch("/api/user/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userProfile.id,
          action: isFollowing ? "unfollow" : "follow",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // 실패 시 원래 상태로 복원
        setIsFollowing(previousFollowing);
        setFollowerCount(previousCount);
        alert(result.error || "팔로우 처리 중 오류가 발생했습니다.");
      } else {
        // 성공 메시지 표시 (선택사항)
        alert(result.message);
      }
    } catch (error) {
      // 네트워크 오류 시 원래 상태로 복원
      console.error("팔로우 요청 실패:", error);
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 상대 시간 표시
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    return formatDate(dateString);
  };

  // 로딩 중일 때 메시지 표시
  if (isLoading || !userProfile) {
    return (
      <div className="profile_container">
        <div className="loading-message">프로필 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="profile_info">
      <div className="profile_info_box flex-start">
        {/* 프로필 이미지 */}
        <div className="profile_img">
          <Image
            src={userProfile?.profile ?? "/profile/basic.png"}
            alt={`${userProfile?.user_nickname || "프로필"} 프로필`}
            width={160}
            height={160}
            className="rounded-full"
          />
          {userProfile?.is_online && <div className="online_indicator"></div>}
        </div>

        {/* 사용자 기본 정보 */}
        <div className="profile_user_info">
          <div className="user_header">
            <h1 className="username">
              {userProfile?.user_nickname || userProfile?.username}
            </h1>
            {userProfile &&
              userProfile.authority != null &&
              userProfile.authority > 0 && (
                <span
                  className={`authority_badge authority-${userProfile.authority}`}
                >
                  {userProfile.authority === 0 && "관리자"}
                </span>
              )}
          </div>

          {userProfile && userProfile.bio && (
            <p className="user_bio">{userProfile.bio}</p>
          )}

          <div className="user_meta">
            <div className="meta_item">
              <span className="label">가입일</span>
              <span className="value">
                {userProfile?.createdAt
                  ? formatDate(userProfile.createdAt)
                  : ""}
              </span>
            </div>
            &middot;
            <div className="meta_item">
              <span className="label">마지막 접속</span>
              <span className="value">
                {userProfile?.last_seen
                  ? getRelativeTime(userProfile.last_seen)
                  : ""}
              </span>
            </div>
          </div>

          {/* 팔로우 버튼 */}
          {isUserId !== userProfile?.id && !userProfile?.isOwnProfile && (
            <div className="follow_section">
              <button
                className={`follow_btn ${isFollowing ? "following" : "follow"}`}
                onClick={handleFollowToggle}
              >
                <span className="follow_btn_text">
                  {isFollowing ? "" : "팔로우"}
                </span>
              </button>
              <p className="follow_description">
                팔로우 시 해당 유저의 활동에 관한 알림을 받을 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="user_stats">
        <div className="stat_item">
          <span className="stat_label">게시글</span>
          <CountUpAnimation
            end={userProfile?.posts_count || 0}
            className="stat_number"
            duration={1200}
          />
        </div>
        <div className="bar"></div>
        <div className="stat_item">
          <span className="stat_label">조회수</span>
          <CountUpAnimation
            end={userProfile?.all_views || 0}
            className="stat_number"
            duration={1500}
            formatNumber={true}
          />
        </div>
        <div className="bar"></div>
        <div className="stat_item">
          <span className="stat_label">팔로워</span>
          <CountUpAnimation
            end={followerCount}
            className="stat_number"
            duration={1000}
          />
        </div>
        <div className="bar"></div>
        <div className="stat_item">
          <span className="stat_label">팔로잉</span>
          <CountUpAnimation
            end={userProfile?.following_count || 0}
            className="stat_number"
            duration={1100}
          />
        </div>
        <div className="bar"></div>
        <div className="stat_item">
          <span className="stat_label">받은 좋아요</span>
          <CountUpAnimation
            end={userProfile?.total_likes_received || 0}
            className="stat_number"
            duration={1400}
          />
        </div>
      </div>

      <div className="profile_tabs_wrap">
        {/* 탭 메뉴 */}
        <div className="profile_tabs">
          <div className="tab_list">
            <button
              className={`tab_btn ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              요약
            </button>
            <span>&middot;</span>
            <button
              className={`tab_btn ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              게시글 ({userProfile?.posts_count || 0})
            </button>
            <span>&middot;</span>
            <button
              className={`tab_btn ${activeTab === "comments" ? "active" : ""}`}
              onClick={() => setActiveTab("comments")}
            >
              댓글 ({userProfile?.comments_count || 0})
            </button>
            <span>&middot;</span>
            <button
              className={`tab_btn ${activeTab === "likes" ? "active" : ""}`}
              onClick={() => setActiveTab("likes")}
            >
              좋아요한 글 ({userProfile?.liked_posts_count || 0})
            </button>
            <span>&middot;</span>
            <button
              className={`tab_btn ${activeTab === "follower" ? "active" : ""}`}
              onClick={() => setActiveTab("follower")}
            >
              팔로워
            </button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab_content" key={activeTab}>
          {activeTab === "summary" && userActivity && (
            <div className="summary_tab tab">
              {/* 관심 게시판 */}
              {userActivity.favorite_boards.length > 0 && (
                <div className="section">
                  <h3>주요 활동 게시판</h3>
                  <div className="favorite_boards">
                    {userActivity.favorite_boards.slice(0, 5).map((board) => (
                      <Link
                        key={board.url_slug}
                        href={`/board/${board.url_slug}`}
                        className="board_tag"
                      >
                        <span>{board.board_name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 최근 게시글 */}
              {userActivity.recent_posts.length > 0 && (
                <div className="section">
                  <h3>최근 게시글</h3>
                  <div className="recent_posts">
                    {userActivity.recent_posts.slice(0, 5).map((post) => (
                      <Link
                        href={`/board/${post.url_slug}/${post.id}`}
                        key={post.id}
                        className="post_item"
                      >
                        <span className="board_name">{post.board_name}</span>
                        <div className="post_title">{post.title}</div>
                        <div className="post_meta">
                          <div className="post_date">
                            <CalendarIcon className="icon" />
                            {getRelativeTime(post.created_at)}
                          </div>
                          &middot;
                          <div className="post_stats">
                            <EyeIcon className="icon" /> {post.views}
                          </div>
                          &middot;
                          <div className="post_stats">
                            <HeartIcon className="icon" /> {post.likes}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 최근 댓글 */}
              {userActivity.recent_comments.length > 0 && (
                <div className="section">
                  <h3>최근 댓글</h3>
                  <div className="recent_comments">
                    {userActivity.recent_comments.slice(0, 5).map((comment) => (
                      <Link
                        key={comment.id}
                        href={`/board/${comment.post_url_slug}/${comment.id}`}
                        className="comment_item"
                      >
                        <div className="comment_content">
                          <TiptapViewer content={comment.content} />
                        </div>
                        <div className="comment_meta">
                          <span className="board_name">
                            {comment.board_name}
                          </span>
                          <div className="post_title">{comment.post_title}</div>
                          &middot;
                          <span className="comment_date">
                            <CalendarIcon className="icon" />
                            {getRelativeTime(comment.created_at)}
                          </span>
                          &middot;
                          <span className="comment_likes">
                            <HeartIcon className="icon" />
                            {comment.likes}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "posts" && userActivity && (
            <section>
              <div className="posts_tab tab">
                <div className="section">
                  <h3>게시글 목록</h3>
                  <div className="recent_posts">
                    {userActivity.recent_posts.length > 0 ? (
                      userActivity.recent_posts.map((post) => (
                        <Link
                          href={`/board/${post.url_slug}/${post.id}`}
                          key={post.id}
                          className="post_item"
                        >
                          <div className="board_name">{post.board_name}</div>
                          <div className="post_title">{post.title}</div>
                          <div className="post_meta">
                            <div className="post_date">
                              <CalendarIcon className="icon" />
                              {formatDate(post.created_at)}
                            </div>
                            <div className="post_stats">
                              <EyeIcon className="icon" />
                              {post.views.toLocaleString()}
                            </div>
                            <div>
                              <HeartIcon className="icon" />
                              {post.likes.toLocaleString()}
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="empty_state">
                        <p>작성한 게시글이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "comments" && userActivity && (
            <div className="comments_tab tab">
              <div className="section">
                <h3>댓글 목록</h3>
                <div className="recent_comments">
                  {userActivity.recent_comments.length > 0 ? (
                    userActivity.recent_comments.map((comment) => (
                      <Link
                        href={`/board/${comment.post_url_slug}/${comment.id}`}
                        key={comment.id}
                        className="comment_item"
                      >
                        <div className="comment_content">
                          <TiptapViewer content={comment.content} />
                        </div>
                        <div className="comment_meta">
                          <span className="board_name">
                            {comment.board_name}
                          </span>
                          <div className="post_title">{comment.post_title}</div>
                          &middot;
                          <span className="comment_date">
                            <CalendarIcon className="icon" />
                            {formatDate(comment.created_at)}
                          </span>
                          &middot;
                          <span className="comment_likes">
                            <HeartIcon className="icon" /> {comment.likes}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="empty_state">
                      <p>작성한 댓글이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "likes" && userActivity && (
            <div className="likes_tab tab">
              <div className="section">
                <h3>좋아요한 글 목록</h3>
                <div className="recent_posts">
                  {userActivity.liked_posts &&
                  userActivity.liked_posts.length > 0 ? (
                    userActivity.liked_posts.map((post) => (
                      <Link
                        href={`/board/${post.url_slug}/${post.id}`}
                        key={post.id}
                        className="post_item"
                      >
                        <span className="board_name">{post.board_name}</span>
                        <div className="post_title">{post.title}</div>
                        <div className="post_meta">
                          <div className="post_date">
                            <CalendarIcon className="icon" />
                            {formatDate(post.created_at)}
                          </div>
                          <div className="post_stats">
                            <EyeIcon className="icon" />
                            {post.views.toLocaleString()}
                          </div>
                          <div>
                            <HeartIcon className="icon" />
                            {post.likes.toLocaleString()}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="empty_state">
                      <p>좋아요한 글이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "follower" && userActivity && (
            <div className="follower_tab tab">
              {userActivity.followers.length > 0 && (
                <div className="section">
                  <h3>팔로워 목록</h3>
                  <div className="followers_list">
                    {userActivity.followers.slice(0, 10).map((follower) => (
                      <Link
                        key={follower.id}
                        href={`/profile/${follower.user_nickname}`}
                        className="follower_item"
                      >
                        <Image
                          src={follower.profile || "/profile/basic.png"}
                          alt={follower.user_nickname}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <span>{follower.user_nickname}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
