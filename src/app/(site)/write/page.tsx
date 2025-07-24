"use client";

import axios from "axios";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";

import Editor from "./Editor";
import { useAuth } from "@/AuthContext";
import { replaceBlobsWithS3Urls } from "@/func/replaceBlobsWithS3Urls";
import { ImageWithBlob, VideoWithBlob } from "@/type/type";

export default function Write() {
  const { isUserId, isUserNick, isUserAuthority } = useAuth();
  const router = useRouter();

  // 권한 확인
  useEffect(() => {
    if (isUserAuthority === 2) {
      alert("정지된 회원은 게시글을 작성할 수 없습니다.");
      router.back();
      return;
    }

    // 주의회원인 경우 제한 기간 확인은 서버에서 처리
  }, [isUserAuthority, router]);

  const { data: boardData } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

  const writeTitle = useRef<HTMLInputElement>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<ImageWithBlob[]>([]);
  const [videoFiles, setVideoFiles] = useState<VideoWithBlob[]>([]);

  const [boardInfo, setBoardInfo] = useState<{ board_name: string; url_slug: string }>({
    board_name: "",
    url_slug: "",
  });

  const posting = async () => {
    const boardname = boardInfo.board_name;
    const url_slug = boardInfo.url_slug;
    const title = writeTitle.current?.value;
    const user_id = isUserId;
    const user_nickname = isUserNick;

    if (!boardname || !title) {
      alert("카테고리와 제목을 모두 입력해 주세요!");
      return;
    }

    if (editorContent.length === 0) {
      alert("내용을 입력해 주세요!");
      return;
    }

    try {
      const content = await replaceBlobsWithS3Urls(editorContent, imageFiles, videoFiles);

      const response = await axios.post("/api/write", {
        boardname,
        url_slug,
        user_id,
        user_nickname,
        title,
        content,
      });

      if (response.data.success) {
        alert("게시글 등록 성공!");
        const postId = response.data.postId;
        router.push(`/board/${url_slug}/${postId}`);
      } else {
        throw new Error("DB 저장 실패");
      }
    } catch (error) {
      console.error("전체 포스팅 실패:", error);
      alert("게시글 작성에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  useEffect(() => {
    if (isUserId === null) {
      alert("로그인이 필요합니다!");
      router.push("/login");
    }
  }, [isUserId, router]);

  return (
    <sub className='sub'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          posting();
        }}
        className='write'>
        <select
          className='board_category'
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedBoard = boardData.boards.find(
              (b: { board_name: string; url_slug: string }) => b.url_slug === e.target.value,
            );
            if (selectedBoard) {
              setBoardInfo({
                board_name: selectedBoard.board_name,
                url_slug: selectedBoard.url_slug,
              });
            } else {
              setBoardInfo({ board_name: "", url_slug: "" });
            }
          }}>
          <option>선택</option>
          {boardData &&
            boardData?.boards?.map((b: { board_name: string; url_slug: string }) => (
              <option key={b.board_name} value={b.url_slug}>
                {b.board_name}
              </option>
            ))}
        </select>
        <div className='write_top'>
          <input type='text' ref={writeTitle} placeholder='제목을 입력해 주세요.' />
        </div>

        <Editor
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          setImageFiles={setImageFiles}
          setVideoFiles={setVideoFiles}
        />

        <div className='btn_wrap btn_posting_wrap'>
          <button type='submit' className='btn btn_posting'>
            POSTING
          </button>
        </div>
      </form>
    </sub>
  );
}
