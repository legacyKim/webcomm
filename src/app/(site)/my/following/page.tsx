"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import MyHeader from "../myHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/solid";

interface FollowUser {
  id: number;
  username: string;
  user_nickname: string;
  profile?: string;
  bio?: string;
}

export default function MyFollowing() {
  const queryClient = useQueryClient();
  const { isUserId } = useAuth();
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following"
  );

  const { data: followData, isLoading } = useQuery({
    queryKey: ["followList", isUserId, activeTab],
    queryFn: async () => {
      const res = await axios.get("/api/user/follow", {
        params: { type: "list", followType: activeTab },
      });
      return res.data;
    },
    enabled: !!isUserId,
    staleTime: 0,
  });

  const handleUnfollow = async (targetUserId: number) => {
    if (!confirm("정말로 언팔로우하시겠습니까?")) return;

    try {
      await axios.post("/api/user/follow", {
        targetUserId,
        action: "unfollow",
      });

      // 쿼리 무효화 (React Query로 최신 목록 갱신)
      queryClient.invalidateQueries({
        queryKey: ["followList", isUserId, activeTab],
      });
    } catch (err) {
      console.error("언팔로우 실패:", err);
      alert("언팔로우에 실패했습니다.");
    }
  };

  const handleFollow = async (targetUserId: number) => {
    try {
      await axios.post("/api/user/follow", {
        targetUserId,
        action: "follow",
      });

      // 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["followList", isUserId, activeTab],
      });
    } catch (err) {
      console.error("팔로우 실패:", err);
      alert("팔로우에 실패했습니다.");
    }
  };

  return (
    <sub className="sub">
      <div className="mypage">
        <MyHeader />

        <div className="mypage_content">
          {/* 탭 메뉴 */}
          <div className="mypage_list_sub">
            <button
              className={activeTab === "following" ? "active" : ""}
              onClick={() => setActiveTab("following")}
            >
              팔로잉
            </button>
            <button
              className={activeTab === "followers" ? "active" : ""}
              onClick={() => setActiveTab("followers")}
            >
              팔로워
            </button>
          </div>

          {isLoading ? (
            <div className="loading_spinner_container">
              <div className="loading_spinner"></div>
              <p>사용자 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="user_list">
              {followData?.users?.length > 0 ? (
                followData.users.map((user: FollowUser) => (
                  <div key={user.id} className="user_item">
                    <div className="user_info">
                      <div className="avatar">
                        {user.profile ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${user.profile}`}
                            alt={user.user_nickname}
                          />
                        ) : (
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/profile/basic.png`}
                            alt={user.user_nickname}
                          />
                        )}
                      </div>
                      <div className="user_details">
                        <div className="nickname">{user.user_nickname}</div>
                        <div className="username">@{user.username}</div>
                        {user.bio && <div className="bio">{user.bio}</div>}
                      </div>
                    </div>
                    <div className="actions">
                      {activeTab === "following" ? (
                        <button
                          className="unfollow_btn"
                          onClick={() => handleUnfollow(user.id)}
                        >
                          <UserMinusIcon className="icon" />
                          언팔로우
                        </button>
                      ) : (
                        <button
                          className="follow_btn"
                          onClick={() => handleFollow(user.id)}
                        >
                          <UserPlusIcon className="icon" />
                          맞팔로우
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty_state">
                  <UserPlusIcon className="empty_icon" />
                  <p>
                    {activeTab === "following"
                      ? "아직 팔로우한 사용자가 없습니다."
                      : "아직 팔로워가 없습니다."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </sub>
  );
}
