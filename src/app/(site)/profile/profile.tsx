"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { UserProfile, UserActivity } from "@/type/type";

// 타입 정의

interface ProfileProps {
  userProfile?: UserProfile | null;
  userActivity?: UserActivity | null;
  currentTab?: "summary" | "posts" | "comments" | "likes" | "follower";
}

export default function Profile({ userProfile, userActivity, currentTab }: ProfileProps) {
  const [isFollowing, setIsFollowing] = useState(userProfile?.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(userProfile?.follower_count || 0);
  const [activeTab, setActiveTab] = useState<"summary" | "posts" | "comments" | "likes" | "follower">(
    currentTab ?? "summary",
  );

  // 디버깅을 위한 로그
  console.log("Profile 컴포넌트 렌더링:", {
    userProfile: userProfile?.username,
    isFollowing,
    followerCount,
    userProfileIsFollowing: userProfile?.isFollowing,
  });

  // 팔로우/언팔로우 핸들러
  const handleFollowToggle = async () => {
    if (!userProfile) {
      console.error("사용자 프로필을 찾을 수 없습니다.");
      return;
    }

    console.log("팔로우 요청 시작:", {
      targetUserId: userProfile.id,
      currentAction: isFollowing ? "unfollow" : "follow",
      currentFollowState: isFollowing,
    });

    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    // 낙관적 업데이트
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));

    console.log("낙관적 업데이트 완료:", {
      newFollowState: !isFollowing,
      newFollowerCount: isFollowing ? followerCount - 1 : followerCount + 1,
    });

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
      console.log("API 응답:", { status: response.status, result });

      if (!response.ok) {
        // 실패 시 원래 상태로 복원
        console.log("API 실패, 상태 복원");
        setIsFollowing(previousFollowing);
        setFollowerCount(previousCount);
        alert(result.error || "팔로우 처리 중 오류가 발생했습니다.");
      } else {
        // 성공 메시지 표시 (선택사항)
        console.log("API 성공:", result.message);
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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;
    return formatDate(dateString);
  };

  return (
    <div className='profile_info'>
      <div className='profile_info_box flex-start'>
        {/* 프로필 이미지 */}
        <div className='profile_img'>
          <Image
            src={userProfile?.profile || "/profile/basic.png"}
            alt={`${userProfile?.user_nickname || userProfile?.username || "프로필"} 프로필`}
            width={200}
            height={200}
            className='rounded-full'
          />
          {userProfile?.is_online && <div className='online_indicator'></div>}
        </div>

        {/* 사용자 기본 정보 */}
        <div className='profile_user_info'>
          <div className='user_header'>
            <h1 className='username'>{userProfile?.user_nickname || userProfile?.username}</h1>
            {userProfile && userProfile.authority != null && userProfile.authority > 0 && (
              <span className={`authority_badge authority-${userProfile.authority}`}>
                {userProfile.authority === 0 && "관리자"}
              </span>
            )}
          </div>

          {userProfile && userProfile.bio && <p className='user_bio'>{userProfile.bio}</p>}

          <div className='user_meta'>
            <div className='meta_item'>
              <span className='label'>가입일</span>
              <span className='value'>{userProfile?.createdAt ? formatDate(userProfile.createdAt) : ""}</span>
            </div>
            &middot;
            <div className='meta_item'>
              <span className='label'>마지막 접속</span>
              <span className='value'>{userProfile?.last_seen ? getRelativeTime(userProfile.last_seen) : ""}</span>
            </div>
          </div>

          {/* 팔로우 버튼 */}
          {!userProfile?.isOwnProfile && (
            <div className='follow_section'>
              <button className={`follow_btn ${isFollowing ? "following" : "follow"}`} onClick={handleFollowToggle}>
                <span className='follow_btn_text'>{isFollowing ? "팔로잉" : "팔로우"}</span>
              </button>
              <p className='follow_description'>팔로우 시 해당 유저의 활동에 관한 알림을 받을 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 통계 정보 */}
      <div className='user_stats'>
        <div className='stat_item'>
          <span className='stat_label'>게시글</span>
          <span className='stat_number'>{userProfile?.all_posts ?? null}</span>
        </div>
        <div className='stat_item'>
          <span className='stat_label'>조회수</span>
          <span className='stat_number'>{userProfile?.all_views ?? null}</span>
        </div>
        <div className='stat_item'>
          <span className='stat_label'>팔로워</span>
          <span className='stat_number'>{followerCount}</span>
        </div>
        <div className='stat_item'>
          <span className='stat_label'>팔로잉</span>
          <span className='stat_number'>{userProfile?.following_count ?? null}</span>
        </div>
        <div className='stat_item'>
          <span className='stat_label'>받은 좋아요</span>
          <span className='stat_number'>{userProfile?.total_likes_received ?? null}</span>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className='profile_tabs'>
        <div className='tab_list'>
          <button
            className={`tab_btn ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}>
            요약
          </button>
          <button className={`tab_btn ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
            게시글 ({userProfile?.all_posts})
          </button>
          <button
            className={`tab_btn ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}>
            댓글
          </button>
          <button className={`tab_btn ${activeTab === "likes" ? "active" : ""}`} onClick={() => setActiveTab("likes")}>
            좋아요한 글
          </button>
          <button
            className={`tab_btn ${activeTab === "follower" ? "active" : ""}`}
            onClick={() => setActiveTab("follower")}>
            팔로워
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='tab_content'>
        {activeTab === "summary" && userActivity && (
          <div className='summary_tab'>
            {/* 관심 게시판 */}
            {userActivity.favorite_boards.length > 0 && (
              <div className='section'>
                <h3>주요 활동 게시판</h3>
                <div className='favorite_boards'>
                  {userActivity.favorite_boards.slice(0, 5).map((board) => (
                    <Link key={board.url_slug} href={`/board/${board.url_slug}`} className='board_tag'>
                      <span>
                        {board.board_name} ({board.activity_count})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 최근 게시글 */}
            {userActivity.recent_posts.length > 0 && (
              <div className='section'>
                <h3>최근 게시글</h3>
                <div className='recent_posts'>
                  {userActivity.recent_posts.slice(0, 5).map((post) => (
                    <div key={post.id} className='post_item'>
                      <Link href={`/board/${post.url_slug}/${post.id}`} className='post_title'>
                        {post.title}
                      </Link>
                      <div className='post_meta'>
                        <span className='post_date'>{getRelativeTime(post.created_at)}</span>
                        &middot;
                        <span className='post_stats'>조회 {post.views}</span>
                        &middot;
                        <span className='post_stats'>좋아요 {post.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 최근 댓글 */}
            {userActivity.recent_comments.length > 0 && (
              <div className='section'>
                <h3>최근 댓글</h3>
                <div className='recent_comments'>
                  {userActivity.recent_comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className='comment_item'>
                      <div className='comment_content'>{comment.content}</div>
                      <div className='comment_meta'>
                        <Link href={`/board/${comment.post_url_slug}/${comment.id}`} className='post_title'>
                          {comment.post_title}
                        </Link>
                        <span className='board_name'>{comment.board_name}</span>
                        <span className='comment_date'>{getRelativeTime(comment.created_at)}</span>
                        <span className='comment_likes'>좋아요 {comment.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "posts" && userActivity && (
          <div className='posts_tab'>
            <div className='posts_list'>
              {userActivity.recent_posts.length > 0 ? (
                userActivity.recent_posts.map((post) => (
                  <div key={post.id} className='post_card'>
                    <div className='post_header'>
                      <Link href={`/board/${post.url_slug}/${post.id}`} className='post_title'>
                        <h4>{post.title}</h4>
                      </Link>
                      <span className='post_board'>{post.board_name}</span>
                    </div>
                    <div className='post_meta'>
                      <span className='post_date'>{formatDate(post.created_at)}</span>
                      <div className='post_stats'>
                        <span>조회 {post.views.toLocaleString()}</span>
                        <span>좋아요 {post.likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='empty_state'>
                  <p>작성한 게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "comments" && userActivity && (
          <div className='comments_tab'>
            <div className='comments_list'>
              {userActivity.recent_comments.length > 0 ? (
                userActivity.recent_comments.map((comment) => (
                  <div key={comment.id} className='comment_card'>
                    <div className='comment_content'>{comment.content}</div>
                    <div className='comment_meta'>
                      <Link href={`/board/${comment.post_url_slug}/${comment.id}`} className='post_link'>
                        {comment.post_title}
                      </Link>
                      <div className='comment_info'>
                        <span className='board_name'>{comment.board_name}</span>
                        <span className='comment_date'>{formatDate(comment.created_at)}</span>
                        <span className='comment_likes'>좋아요 {comment.likes}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='empty_state'>
                  <p>작성한 댓글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "likes" && (
          <div className='likes_tab'>
            <div className='empty_state'>
              <p>좋아요한 글 목록은 준비 중입니다.</p>
              <p className='sub_text'>향후 업데이트에서 제공될 예정입니다.</p>
            </div>
          </div>
        )}

        {activeTab === "follower" && userActivity && (
          <div className='follower_tab'>
            {/* 팔로워 목록 */}
            {userActivity.followers.length > 0 && (
              <div className='section'>
                <h3>팔로워</h3>
                <div className='followers_list'>
                  {userActivity.followers.slice(0, 10).map((follower) => (
                    <Link key={follower.id} href={`/profile/${follower.username}`} className='follower_item'>
                      <Image
                        src={follower.profile || "/profile/basic.png"}
                        alt={follower.user_nickname || follower.username}
                        width={40}
                        height={40}
                        className='rounded-full'
                      />
                      <span>{follower.user_nickname || follower.username}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
