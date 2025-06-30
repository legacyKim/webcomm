"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import MyHeader from "../myHeader";
import { useAuth } from "@/AuthContext";

interface BlockedUser {
  id: number;
  user_nickname: string;
  profile?: string;
  created_at: string;
}

export default function MyBlocked() {
  const queryClient = useQueryClient();

  const { isUserId } = useAuth();

  const { data: blockedUsers = [], isLoading } = useQuery<BlockedUser[]>({
    queryKey: ["blockedUsers", isUserId],
    queryFn: async () => {
      const res = await axios.get("/api/user/block", {
        params: { userId: isUserId },
      });
      return res.data;
    },
    enabled: !!isUserId,
    staleTime: 0,
  });

  const block_off = async (blockedId: number) => {
    if (!confirm("정말로 차단을 해제하시겠습니까?")) return;

    try {
      await axios.delete("/api/user/block", {
        data: { blockerId: isUserId, blockedId }, // DELETE는 body에 담아야 함
      });

      // 쿼리 무효화 (React Query로 최신 목록 갱신)
      queryClient.invalidateQueries({ queryKey: ["blockedUsers", isUserId] });
    } catch (err) {
      console.error("차단 해제 실패:", err);
      alert("차단 해제에 실패했습니다.");
    }
  };

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />

        <div className='mypage_content'>
          <div className='mypage_inner'>
            {isLoading ? (
              <p>잠시만 기다려 주세요.</p>
            ) : blockedUsers.length === 0 ? (
              <div className='data_none'>차단한 유저가 없습니다.</div>
            ) : (
              <ul className='block_list board_list'>
                {blockedUsers.map((user) => (
                  <li key={user.id}>
                    <div className='writer'>
                      <img
                        className='profile_img'
                        src={user.profile ?? "/profile/basic.png"}
                        alt={user.user_nickname}
                        width={32}
                        height={32}
                      />
                      <span className='writer_name'>{user.user_nickname}</span>
                    </div>

                    <span className='date'>{new Date(user.created_at).toLocaleDateString()}</span>

                    <button
                      className='block_btn btn_line_grey'
                      onClick={() => {
                        block_off(user.id);
                      }}>
                      차단 해제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </sub>
  );
}
