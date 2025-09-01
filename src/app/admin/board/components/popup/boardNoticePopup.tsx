"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";

import axios from "axios";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Notice } from "@/type/adminType";

export default function BoardNoticePopup({
  setPopupOpen,
  editingNotice,
  setEditingNotice,
}: {
  setPopupOpen: (value: boolean) => void;
  editingNotice: Notice | null;
  setEditingNotice: (notice: Notice | null) => void;
}) {
  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoard,
  });
  const [boardInfo, setBoardInfo] = useState<{
    board_name: string;
    url_slug: string;
  }>({
    board_name: "",
    url_slug: "",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    if (editingNotice && editor) {
      setBoardInfo({
        board_name: editingNotice.url_slug,
        url_slug: editingNotice.url_slug,
      });
      setTitle(editingNotice.title);
      editor.commands.setContent(editingNotice.content);
    }
  }, [editingNotice, editor]);

  const [title, setTitle] = useState("");

  const noticeSubmit = async () => {
    if (!editor) return;

    const boardname = boardInfo.board_name;
    const url_slug = boardInfo.url_slug;

    const content = editor.getHTML();

    try {
      const res = await axios.post("/api/notice", {
        boardname,
        url_slug,
        title,
        content,
      });

      if (res.data.success) {
        alert("공지사항이 등록되었습니다.");
        setPopupOpen(false);
        setTitle(""); // 제목 초기화
        editor?.commands.clearContent(); // 에디터 내용 초기화
      } else {
        alert("등록 실패: " + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("오류 발생");
    }
  };

  const noticeCorrect = async () => {
    if (!editor || !editingNotice) return;

    const boardname = boardInfo.board_name;
    const url_slug = boardInfo.url_slug;

    const content = editor.getHTML();
    try {
      const res = await axios.patch(`/api/notice/${editingNotice.id}`, {
        boardname,
        url_slug,
        title,
        content,
      });

      if (res.data.success) {
        alert("공지사항이 수정되었습니다.");
        setPopupOpen(false);
        setEditingNotice(null); // 편집 상태 초기화
        setTitle(""); // 제목 초기화
        editor?.commands.clearContent(); // 에디터 내용 초기화
      } else {
        alert("수정 실패: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin_popup_bg">
      <div className="admin_popup">
        <div className="admin_popup_header">
          <h3>공지사항 작성</h3>
          <button onClick={() => setPopupOpen(false)}>
            <XMarkIcon className="icon" />
          </button>
        </div>

        <div className="admin_popup_content">
          <div className="admin_notice_select_title">
            <select
              className="board_category"
              value={boardInfo.url_slug}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const selectedBoard = boardData?.boards?.find(
                  (b: { board_name: string; url_slug: string }) =>
                    b.url_slug === e.target.value
                );
                if (selectedBoard) {
                  setBoardInfo({
                    board_name: selectedBoard.board_name,
                    url_slug: selectedBoard.url_slug,
                  });
                } else {
                  setBoardInfo({ board_name: "", url_slug: "" });
                }
              }}
            >
              <option>선택</option>
              {boardData &&
                boardData?.boards?.map(
                  (b: { board_name: string; url_slug: string }) => (
                    <option key={b.board_name} value={b.url_slug}>
                      {b.board_name}
                    </option>
                  )
                )}
            </select>
            <input
              className="notice_title_input"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div
            className="notice_editor_wrapper"
            onClick={() => {
              if (editor) {
                editor.commands.focus();
              }
            }}
          >
            <EditorContent editor={editor} className="notice_editor" />
          </div>
        </div>

        <div className="admin_popup_footer">
          {editingNotice ? (
            <button onClick={noticeCorrect}>수정</button>
          ) : (
            <button onClick={noticeSubmit}>저장</button>
          )}
          <button
            className="btn_secondary"
            onClick={() => {
              setPopupOpen(false);
              setEditingNotice(null);
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
