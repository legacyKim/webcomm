"use client";

import axios from "axios";

import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";

import Editor from "../Editor";
import { useAuth } from "@/AuthContext";

import { Posts } from "@/type/type";
import { ImageWithBlob, VideoWithBlob } from "@/type/type";

export default function Write() {
  const { isUserId, isUsername, isUserNick } = useAuth();
  const router = useRouter();

  const { id } = useParams();

  const { data: boardData } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

  const writeTitle = useRef<HTMLInputElement>(null);
  const [editorContent, setEditorContent] = useState<string>("");

  const [imageFiles, setImageFiles] = useState<ImageWithBlob[]>([]);
  const [videoFiles, setVideoFiles] = useState<VideoWithBlob[]>([]);

  const [boardInfo, setBoardInfo] = useState<{ board_name: string; url_slug: string }>({
    board_name: "",
    url_slug: "",
  });

  const [writeData, setWriteData] = useState<Posts | null>(null);

  // 글 불러오기
  useEffect(() => {
    const fetchWrite = async () => {
      try {
        const response = await axios.get(`/api/write/${id}`);
        const post = response.data.posts.rows[0];

        if (response.data.success && post) {
          setWriteData(post);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (id) fetchWrite(); // id가 존재할 때만 실행
  }, [id]);

  // 글 수정 POST 요청
  const postCorrecting = async () => {
    if (isUsername === null) {
      const isConfirm = confirm("로그인이 필요합니다. 이동할 시 글이 저장되지 않습니다. 이동하시겠습니까?");
      if (isConfirm) {
        router.push("/login");
      }
      return;
    }

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
      // FormData로 파일과 데이터를 함께 전송
      const formData = new FormData();
      formData.append("id", id as string);
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
        }),
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
        }),
      );

      formData.append("imageFiles", JSON.stringify(imageFilesData));
      formData.append("videoFiles", JSON.stringify(videoFilesData));

      const response = await axios.put(`/api/write/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("게시글이 수정됐습니다!");
        router.push(`/board/${boardInfo.url_slug}/${id}`);
      }
    } catch (error) {
      console.log(error);
      alert("게시글 수정에 실패했습니다.");
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
    if (isUserId === 0) {
      const isConfirmed = confirm("로그인이 필요합니다.");
      if (isConfirmed) {
        router.push("/login");
      } else {
        return;
      }
    }
  }, [isUsername, router]);

  useEffect(() => {
    if (writeData !== null) {
      setBoardInfo({ board_name: writeData.board_name, url_slug: writeData.url_slug });
      setEditorContent(writeData.content);
      if (writeTitle.current) {
        writeTitle.current.value = writeData.title;
      }
    }
  }, [writeData]);

  if (writeData === null) {
    return (
      <div className='data_wait'>
        <span>잠시만 기다려 주세요.</span>
        <div className='dots'>
          <span className='dot dot1'>.</span>
          <span className='dot dot2'>.</span>
          <span className='dot dot3'>.</span>
        </div>
      </div>
    );
  }

  return (
    <sub className='sub'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          postCorrecting();
        }}
        className='write'>
        <select
          className='board_category'
          value={boardInfo.url_slug}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedBoard = boardData.boards.rows.find(
              (b: { board_name: string; url_slug: string }) => b.url_slug === e.target.value,
            );
            if (selectedBoard) {
              setBoardInfo({
                board_name: selectedBoard.board_name,
                url_slug: selectedBoard.url_slug,
              });
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
          <input type='text' ref={writeTitle} />
        </div>

        <Editor
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          setImageFiles={setImageFiles}
          setVideoFiles={setVideoFiles}
        />

        <div className='btn_wrap btn_posting_wrap'>
          <button type='submit' className='btn btn_posting'>
            EDITING
          </button>
        </div>
      </form>
    </sub>
  );
}
