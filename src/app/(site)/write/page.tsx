"use client";

import axios from "axios";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";

import Editor from "./Editor";
import { useAuth } from "@/contexts/AuthContext";
import { ImageWithBlob, VideoWithBlob } from "@/type/type";

interface boards {
  id: number;
  board_name: string;
  url_slug: string;
}

interface boardInfo {
  board_id: number | null;
  board_name: string;
  url_slug: string;
}

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

  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoard,
  });

  const writeTitle = useRef<HTMLInputElement>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<ImageWithBlob[]>([]);
  const [videoFiles, setVideoFiles] = useState<VideoWithBlob[]>([]);

  const [boardInfo, setBoardInfo] = useState<boardInfo>({
    board_id: null,
    board_name: "",
    url_slug: "",
  });

  const posting = async () => {
    const boardId = boardInfo.board_id;
    const boardname = boardInfo.board_name;
    const url_slug = boardInfo.url_slug;
    const title = writeTitle.current?.value;
    const user_id = isUserId;
    const user_nickname = isUserNick;

    if (!boardId || !boardname || !title) {
      alert("카테고리와 제목을 모두 입력해 주세요!");
      return;
    }

    if (editorContent.length === 0) {
      alert("내용을 입력해 주세요!");
      return;
    }

    try {
      // FormData로 파일과 데이터를 함께 전송
      const formData = new FormData();
      formData.append("board_id", boardId.toString());
      formData.append("boardname", boardname);
      formData.append("url_slug", url_slug);
      formData.append("user_id", (user_id || 0).toString());
      formData.append("user_nickname", user_nickname || "");
      formData.append("title", title || "");
      formData.append("content", editorContent);

      // 이미지 파일 데이터를 base64로 변환하여 전송
      const imageFilesData = await Promise.all(
        imageFiles.map(async (img) => {
          const base64 = await fileToBase64(img.file);
          return {
            name: img.file.name,
            type: img.file.type,
            data: base64.split(",")[1], // data:image/... 부분 제거
            blobUrl: img.blobUrl,
          };
        })
      );

      // 비디오 파일 데이터를 base64로 변환하여 전송
      const videoFilesData = await Promise.all(
        videoFiles.map(async (vid) => {
          const base64 = await fileToBase64(vid.file);
          return {
            name: vid.file.name,
            type: vid.file.type,
            data: base64.split(",")[1], // data:video/... 부분 제거
            blobUrl: vid.blobUrl,
          };
        })
      );

      formData.append("imageFiles", JSON.stringify(imageFilesData));
      formData.append("videoFiles", JSON.stringify(videoFilesData));

      const response = await axios.post("/api/write", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("게시글 등록 성공!");
        const postId = response.data.data.id;
        router.push(`/board/${url_slug}/${postId}`);
      } else {
        throw new Error("DB 저장 실패");
      }
    } catch (error) {
      console.error("전체 포스팅 실패:", error);
      alert("게시글 작성에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // 파일을 base64로 변환하는 헬퍼 함수
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (isUserId === null) {
      alert("로그인이 필요합니다!");
      router.push("/login");
    }
  }, [isUserId, router]);

  return (
    <sub className="sub">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          posting();
        }}
        className="write"
      >
        <select
          className="board_category"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedBoard = boardData?.boards?.find(
              (b: boards) => b.url_slug === e.target.value
            );
            if (selectedBoard) {
              setBoardInfo({
                board_id: selectedBoard.id,
                board_name: selectedBoard.board_name,
                url_slug: selectedBoard.url_slug,
              });
            } else {
              setBoardInfo({ board_id: null, board_name: "", url_slug: "" });
            }
          }}
        >
          <option>선택</option>
          {boardData &&
            boardData?.boards?.map((b: boards) => (
              <option key={b.id} value={b.url_slug}>
                {b.board_name}
              </option>
            ))}
        </select>
        <div className="write_top">
          <input
            type="text"
            ref={writeTitle}
            placeholder="제목을 입력해 주세요."
          />
        </div>

        <Editor
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          setImageFiles={setImageFiles}
          setVideoFiles={setVideoFiles}
        />

        <div className="btn_wrap btn_posting_wrap">
          <button type="submit" className="btn btn_posting">
            POSTING
          </button>
        </div>
      </form>
    </sub>
  );
}
