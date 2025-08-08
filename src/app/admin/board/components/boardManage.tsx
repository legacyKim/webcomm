"use client";

import { Board } from "@/type/type";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";
import { useState } from "react";
import BoardManagePopup from "./popup/boardManagePopup";

export default function BoardManage() {
  const {
    data: boardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoard,
  });

  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [popupCorr, setPopupCorr] = useState<{
    id: number;
    seq: number;
    board_name: string;
    url_slug: string;
  }>({
    id: 0,
    seq: 0,
    board_name: "",
    url_slug: "",
  });
  const [popupOption, setPopupOption] = useState<string>("");

  // 게시판 삭제
  const handleDeleteBoard = async (boardId: number, boardName: string) => {
    if (
      !confirm(
        `'${boardName}' 게시판을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    )
      return;

    try {
      const response = await fetch("/api/admin/boards/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId }),
      });

      if (response.ok) {
        alert("게시판이 삭제되었습니다.");
        refetch(); // 데이터 새로고침
      } else {
        const error = await response.json();
        throw new Error(error.message || "삭제 실패");
      }
    } catch (error) {
      alert(
        `게시판 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  };

  // 게시판 순서 변경
  const handleMoveBoard = async (boardId: number, direction: "up" | "down") => {
    try {
      const response = await fetch("/api/admin/boards/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, direction }),
      });

      if (response.ok) {
        refetch(); // 데이터 새로고침
      } else {
        throw new Error("순서 변경 실패");
      }
    } catch {
      alert("게시판 순서 변경 중 오류가 발생했습니다.");
    }
  };

  const openEditPopup = (board: Board) => {
    if (popupOpen) return; // 이미 팝업이 열려있으면 무시

    setPopupCorr({
      id: board.id,
      seq: board.seq,
      board_name: board.board_name,
      url_slug: board.url_slug,
    });
    setPopupOption("edit");
    setPopupOpen(true);
  };

  const openAddPopup = () => {
    if (popupOpen) return; // 이미 팝업이 열려있으면 무시

    setPopupCorr({ id: 0, seq: 0, board_name: "", url_slug: "" });
    setPopupOption("save");
    setPopupOpen(true);
  };

  return (
    <div className="admin_content_wrap">
      <div className="admin_title">
        <h4>게시판 관리</h4>
        <div className="admin_btn">
          <button onClick={openAddPopup}>게시판 추가</button>
        </div>
      </div>

      <div className="admin_content">
        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <ol className="table">
            <li className="table_header">
              <span>순서</span>
              <span>게시판</span>
              <span>URL</span>
              <span>게시물 총합</span>
              <span>게시물 총 조회수</span>
              <span>관리</span>
            </li>
            {boardData?.boards?.map((b: Board, index: number) => (
              <li key={b.id}>
                <span className="board-seq">
                  {b.seq}
                  <div className="seq-controls">
                    <button
                      onClick={() => handleMoveBoard(b.id, "up")}
                      disabled={index === 0}
                      className="seq-btn"
                      title="위로 이동"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveBoard(b.id, "down")}
                      disabled={index === boardData.boards.length - 1}
                      className="seq-btn"
                      title="아래로 이동"
                    >
                      ↓
                    </button>
                  </div>
                </span>
                <span className="board-name">{b.board_name}</span>
                <span className="board-url">/{b.url_slug}</span>
                <span>{b.post_count || 0}</span>
                <span>{b.total_views || 0}</span>
                <span className="board-actions">
                  <button onClick={() => openEditPopup(b)} className="edit-btn">
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteBoard(b.id, b.board_name)}
                    className="delete-btn"
                  >
                    삭제
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {popupOpen && boardData && (
        <BoardManagePopup
          setPopupOpen={setPopupOpen}
          boardData={boardData}
          popupCorr={popupCorr}
          popupOption={popupOption}
        />
      )}

      <style jsx>{`
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .board-seq {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .seq-controls {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .seq-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          width: 20px;
          height: 20px;
          font-size: 10px;
          cursor: pointer;
          border-radius: 2px;
        }

        .seq-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .seq-btn:hover:not(:disabled) {
          background: #e9ecef;
        }

        .board-name {
          font-weight: 600;
          color: #333;
        }

        .board-url {
          font-family: monospace;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          color: #666;
        }

        .board-actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .edit-btn:hover {
          background: #0056b3;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .board-actions {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
