"use client";

import { useState } from "react";
import axios from "axios";

interface BoardRecommendProps {
  boardRecommendPopup: boolean;
  setBoardRecommendPopup: (value: boolean) => void;
}

export default function BoardRecommend({
  setBoardRecommendPopup,
}: BoardRecommendProps) {
  const [boardName, setBoardName] = useState("");
  const [reason, setReason] = useState("");

  const recommendBtn = async ({
    boardName,
    reason,
  }: {
    boardName: string;
    reason: string | null;
  }) => {
    if (!boardName.trim()) {
      alert("게시판 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("/api/admin/board-recommend", {
        board_name: boardName.trim(),
        reason: reason?.trim() || null,
      });

      if (response.data.success) {
        alert("게시판 추천이 접수되었습니다.");
        setBoardName("");
        setReason("");
      }
    } catch (error) {
      console.log(error);
      alert("게시판 추천 중 오류가 발생했습니다.");
    } finally {
      setBoardRecommendPopup(false);
    }
  };

  return (
    <div
      className="send_message"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="send_message_box">
        <div className="send_to">
          <h4>게시판을 추천합니다!</h4>
        </div>
        <div className="send_message_textarea">
          <input
            value={boardName}
            onChange={(e) => {
              setBoardName(e.target.value);
            }}
            type="text"
            placeholder="추천 게시판 이름을 입력해 주세요."
          ></input>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="게시판 추천 이유를 입력해 주세요."
          />
        </div>
        <div className="btn_wrap">
          <button
            className="btn"
            onClick={() => {
              recommendBtn({
                boardName,
                reason,
              });
            }}
          >
            보내기
          </button>
          <button
            className="cancel"
            onClick={() => setBoardRecommendPopup(false)}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
