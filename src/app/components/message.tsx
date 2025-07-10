"use client";

import { useState } from "react";
import axios from "axios";

export default function Message({
  messageFromUser,
  messageToUser,
  messageToUserNickname,
  setMessageToUser,
}: {
  messageFromUser: number | null;
  messageToUser: number | null;
  messageToUserNickname: string | null;
  setMessageToUser: (value: number | null) => void;
}) {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!messageToUser || !message.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      const res = await axios.post("/api/message/send", {
        to: messageToUser,
        message,
        from: messageFromUser,
      });
      if (res.data.success) {
        alert(res.data.message);
        setMessage("");
        setMessageToUser(null);
      }
    } catch (err) {
      console.error(err);
      alert("쪽지 전송에 실패했습니다.");
    }
  };

  return (
    <div
      className='send_message'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
      <div className='send_message_box'>
        <div className='send_to'>
          <h4>{messageToUserNickname}</h4> 님에게 쪽지를 보냅니다.
        </div>
        <div className='send_message_textarea'>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder='내용을 입력하세요.' />
        </div>
        <div className='btn_wrap'>
          <button className='btn' onClick={sendMessage}>
            보내기
          </button>
          <button
            className='cancel'
            onClick={() => {
              setMessageToUser(null);
            }}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
