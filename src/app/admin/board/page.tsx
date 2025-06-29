"use client";

import { useState } from "react";

import BoardManage from "./components/boardManage";
import BoardConManage from "./components/boardConManage";
import BoardStorage from "./components/boardStorage";

export default function Board() {
  const [section, setSection] = useState<string>("boardManage");

  return (
    <div className='admin_page'>
      <menu className='left_menu'>
        <button
          onClick={() => {
            setSection("boardManage");
          }}>
          게시판 관리
        </button>
        <button
          onClick={() => {
            setSection("boardConManage");
          }}>
          게시글 관리
        </button>
        <button
          onClick={() => {
            setSection("boardStorage");
          }}>
          게시글 보관
        </button>
      </menu>

      {section === "boardManage" ? (
        <BoardManage section={section} />
      ) : section === "boardConManage" ? (
        <BoardConManage section={section} />
      ) : section === "boardStorage" ? (
        <BoardStorage />
      ) : null}
    </div>
  );
}
