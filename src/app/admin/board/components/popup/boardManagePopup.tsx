"use client";
import axios from "axios";

import { useState, useEffect } from "react";

interface BoardPop {
  boards: {
    id: number;
    seq: number;
    board_name: string;
    url_slug: string;
  }[];
}

export default function BoardManagePopup({
  setPopupOpen,
  boardData,
  popupCorr,
  popupOption,
}: {
  setPopupOpen: (value: boolean) => void;
  boardData: BoardPop;
  popupCorr: { id: number; seq: number; board_name: string; url_slug: string };
  popupOption: string;
}) {
  const [boardName, setBoardName] = useState<string>("");
  const [urlSlug, setUrlSlug] = useState<string>("");
  const [seq, setSeq] = useState<number>();
  const [id, setPutId] = useState<number>();

  useEffect(() => {
    setBoardName(popupCorr.board_name);
    setUrlSlug(popupCorr.url_slug);
    setSeq(popupCorr.seq);
    setPutId(popupCorr.id);
  }, [popupCorr]);

  const postBoard = async ({ boardName, urlSlug }: { boardName: string; urlSlug: string }) => {
    if (boardName === "") {
      alert("게시판 명을 입력해 주세요.");
      return;
    }

    if (boardData?.boards?.some((row) => row.board_name === boardName)) {
      alert("게시판 명이 중복됩니다.");
      return;
    }

    if (urlSlug === "") {
      alert("URL 명을 입력해 주세요.");
      return;
    }

    if (urlSlug.includes(" ")) {
      alert("URL 명에는 띄어쓰기가 들어갈 수 없습니다.");
      return;
    }

    if (!/^[a-zA-Z]+$/.test(urlSlug)) {
      alert("URL 명은 영문만 가능합니다.");
      return;
    }

    if (boardData?.boards?.some((row) => row.url_slug === urlSlug)) {
      alert("URL 명이 중복됩니다.");
      return;
    }

    const res = await axios.post("/api/board", {
      boardName,
      urlSlug,
    });

    if (res.data.success) {
      alert("게시판이 추가되었습니다!");
      setPopupOpen(false);
    }
  };

  const putBoard = async ({
    id,
    seq,
    boardName,
    urlSlug,
  }: {
    id: number;
    seq: number;
    boardName: string;
    urlSlug: string;
  }) => {
    if (boardData?.boards?.some((row) => row.seq === seq)) {
      alert("순번이 중복됩니다.");
      return;
    }

    if (boardName === "") {
      alert("게시판 명을 입력해 주세요.");
      return;
    }

    if (urlSlug === "") {
      alert("URL 명을 입력해 주세요.");
      return;
    }

    if (urlSlug.includes(" ")) {
      alert("URL 명에는 띄어쓰기가 들어갈 수 없습니다.");
      return;
    }

    if (!/^[a-zA-Z]+$/.test(urlSlug)) {
      alert("URL 명은 영문만 가능합니다.");
      return;
    }

    const res = await axios.put("/api/board", {
      id,
      seq,
      boardName,
      urlSlug,
    });

    if (res.data.success) {
      alert("게시판이 변경되었습니다!");
      setPopupOpen(false);
    }
  };

  return (
    <div className='admin_popup_bg'>
      <div className='admin_popup admin_popup_mo'>
        <div className='admin_popup_header'>
          <h6>게시판 추가</h6>
          <button
            onClick={() => {
              setPopupOpen(false);
            }}>
            <i className='icon-cancel'></i>
          </button>
        </div>

        <div className='admin_popup_content'>
          <div className='input_box'>
            <span>게시판 순서</span>
            <input
              type='text'
              value={seq}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "" || /^[0-9\b]+$/.test(value)) {
                  setSeq(parseInt(value) || 0);
                } else {
                  alert("숫자만 입력해 주세요.");
                }
              }}
            />
          </div>
          <div className='input_box'>
            <span>게시판 이름</span>
            <input
              type='text'
              value={boardName}
              onChange={(e) => {
                setBoardName(e.target.value);
              }}
            />
          </div>
          <div className='input_box'>
            <span>게시판 URL 설정</span>
            <input
              type='text'
              value={urlSlug}
              onChange={(e) => {
                setUrlSlug(e.target.value);
              }}
            />
          </div>
        </div>

        <div className='admin_popup_footer'>
          {popupOption === "save" ? (
            <button
              onClick={() => {
                postBoard({ boardName, urlSlug });
              }}>
              저장
            </button>
          ) : (
            <button
              onClick={() => {
                if (id && seq) {
                  putBoard({ id, seq, boardName, urlSlug });
                }
              }}>
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
