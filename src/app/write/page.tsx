"use client";

import axios from "axios";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "../api/api";

import Editor from "./Editor";
import { useAuth } from "@/AuthContext";
import { ImageWithBlob, VideoWithBlob } from "@/type/type";

export interface BlobFile {
  file: File;
  blobUrl: string;
}

export default function Write() {
  const { isUserId, isUserNick } = useAuth();
  const router = useRouter();

  const { data: boardData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

  const writeTitle = useRef<HTMLInputElement>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<ImageWithBlob[]>([]);
  const [videoFiles, setVideoFiles] = useState<VideoWithBlob[]>([]);

  const [boardInfo, setBoardInfo] = useState<{ board_name: string; url_slug: string }>({
    board_name: "",
    url_slug: "",
  });

  console.log(boardInfo);

  const posting = async () => {
    const url_slug = boardInfo.url_slug;
    const boardname = boardInfo.board_name;
    const title = writeTitle.current?.value;

    if (!boardname || !title) {
      alert("카테고리와 제목을 모두 입력해 주세요!");
      return;
    }

    const user_id = isUserId;
    const user_nickname = isUserNick;

    const replaceBlobsWithS3Urls = async (html: string, images: BlobFile[], videos: BlobFile[]) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const processTags = async (tagName: string, attrName: string, files: BlobFile[]) => {
        const tags = Array.from(doc.querySelectorAll(tagName));
        for (const tag of tags) {
          const src = tag.getAttribute(attrName);
          const match = files.find(({ blobUrl }) => blobUrl === src);

          if (match) {
            const file = match.file;
            const fileName = encodeURIComponent(file.name);
            const presignedRes = await axios.get(`/api/upload/${fileName}`);
            const { url, fileUrl } = presignedRes.data;

            try {
              await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
              });
              tag.setAttribute(attrName, fileUrl);
            } catch (uploadError) {
              console.error("파일 업로드 실패:", file.name, uploadError);
              throw new Error("업로드 중 문제가 발생했습니다. 다시 시도해 주세요.");
            }
          }
        }
      };

      await processTags("img", "src", images);
      await processTags("video", "src", videos);
      await processTags("source", "src", videos); // for <video><source src=...>

      return doc.body.innerHTML;
    };

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
        router.push(`/board/${url_slug}`);
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

  if (isUserId === null) {
    return null;
  }

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
