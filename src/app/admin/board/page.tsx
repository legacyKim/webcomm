"use client";

import { useState } from "react";

import BoardManage from "./components/boardManage";
import BoardConManage from "./components/boardConManage";
import BoardStorage from "./components/boardStorage";
import BoardNoticeManage from "./components/boardNoticeManage";

export default function Board() {
  const [section, setSection] = useState<string>("boardNoticeManage");

  return (
    <div className='admin_page'>
      <menu className='left_menu'>
        <button
          onClick={() => {
            setSection("boardNoticeManage");
          }}>
          공지 관리
        </button>
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
        <BoardManage />
      ) : section === "boardConManage" ? (
        <BoardConManage />
      ) : section === "boardStorage" ? (
        <BoardStorage />
      ) : section === "boardNoticeManage" ? (
        <BoardNoticeManage />
      ) : null}
    </div>
  );
}
