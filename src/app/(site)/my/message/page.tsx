"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

import { useAuth } from "@/AuthContext";
import Message from "@/components/message";

import { NoSymbolIcon } from "@heroicons/react/24/solid";

interface Message {
  id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  type: "received" | "sent";
  user_id: number;
  user_nickname: string;
  profile: string;
}

export default function MyMessage() {
  const { isUserId, messageToUser, setMessageToUser } = useAuth();
  const [filter, setFilter] = useState<"received" | "sent">("received");

  const queryClient = useQueryClient();

  const { data = { received: [], sent: [] }, isLoading } = useQuery<{ received: Message[]; sent: Message[] }>({
    queryKey: ["messages", isUserId],
    queryFn: async () => {
      const res = await axios.get("/api/message/", {
        params: { userId: isUserId },
      });
      return res.data;
    },
    enabled: !!isUserId,
    staleTime: Infinity,
  });

  const messages = filter === "received" ? data.received : data.sent;

  const [messageNickname, setMessageNickname] = useState<string | null>(null);

  const sendMessage = (user_id: number) => {
    setMessageToUser(user_id);
  };

  // 메시지 삭제
  const messageDelete = async (messageId: number) => {
    if (!isUserId) return;

    const confirmDelete = confirm("쪽지를 삭제하시겠습니까? 삭제하신 메세지는 확인하실 수 없습니다.");
    if (!confirmDelete) return;

    try {
      await axios.put("/api/message", {
        messageId,
        userId: isUserId,
        type: filter,
      });

      // 쿼리 무효화 → 자동 최신화
      queryClient.invalidateQueries({ queryKey: ["messages", isUserId] });
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("쪽지 삭제 중 오류가 발생했습니다.");
    }
  };

  const reportUser = async (messageId: number) => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (!reason) return;

    try {
      const response = await axios.post("/api/user/report", {
        isUserId,
        reportedUserId: messageId,
        reason,
        type: "message",
      });
      if (response.data.success) {
        alert("신고가 접수되었습니다.");
      }
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고에 실패했습니다.");
    }
  };

  return (
    <sub className='sub'>
      <div className='mypage'>
        <div className='mypage_content'>
          <div className='mypage_message'>
            <div className='mypage_list_sub'>
              <button
                className={`${filter === "received" ? "active" : ""}`}
                onClick={() => setFilter("received")}
                disabled={filter === "received"}>
                받은 쪽지
              </button>
              <button
                className={`${filter === "sent" ? "active" : ""}`}
                onClick={() => setFilter("sent")}
                disabled={filter === "sent"}>
                보낸 쪽지
              </button>
            </div>

            <div className='mypage_message_box'>
              {isLoading ? (
                <div className='data_wait'>
                  <span>잠시만 기다려 주세요.</span>
                  <div className='dots'>
                    <span className='dot dot1'>.</span>
                    <span className='dot dot2'>.</span>
                    <span className='dot dot3'>.</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className='data_none'>
                  <NoSymbolIcon />
                  <span>쪽지가 없습니다.</span>
                </div>
              ) : (
                <ul className='message_list board_list'>
                  {messages.map((msg, index) => (
                    <li key={msg.id}>
                      <span className='num'>{index}</span>
                      <div className='message_box'>
                        <div className='message_box_top'>
                          <div className='writer'>
                            <img
                              className='profile_img'
                              src={msg.profile ?? "/profile/basic.png"}
                              alt={`${msg.user_nickname}의 프로필 이미지`}
                              width={32}
                              height={32}
                            />
                            <span className='writer_name'>{msg.user_nickname}</span>
                          </div>
                          <div className='btn_wrap'>
                            {filter === "received" && (
                              <button
                                onClick={() => {
                                  sendMessage(msg.user_id);
                                  setMessageNickname(msg.user_nickname);
                                }}>
                                답장
                              </button>
                            )}
                            <button
                              onClick={() => {
                                reportUser(msg.user_id);
                              }}>
                              신고
                            </button>
                            <button
                              onClick={() => {
                                messageDelete(msg.id);
                              }}>
                              삭제
                            </button>
                          </div>
                        </div>
                        <p className='message'>{msg.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      {messageToUser !== null && (
        <Message
          messageFromUser={isUserId}
          messageToUser={messageToUser}
          messageToUserNickname={messageNickname}
          setMessageToUser={setMessageToUser}
        />
      )}
    </sub>
  );
}
