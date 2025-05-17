"use client";

import axios from 'axios';

import { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from '../api/api';

import Editor from './Editor';
import { useAuth } from '../AuthContext'
import { ImageWithBlob } from '../type/type';

export default function Write() {

    const { isUsername, isUserNick } = useAuth();
    const router = useRouter();

    const { data: boardData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

    const writeTitle = useRef<HTMLInputElement>(null);
    const [editorContent, setEditorContent] = useState<string>('');
    const [imageFiles, setImageFiles] = useState<ImageWithBlob[]>([]);

    const [boardInfo, setBoardInfo] = useState<{ board_name: string; url_slug: string }>({ board_name: "", url_slug: "" });

    const posting = async () => {

        const url_slug = boardInfo.url_slug;
        const boardname = boardInfo.board_name;
        const title = writeTitle.current?.value;

        if (!boardname || !title) {
            alert("카테고리와 제목을 모두 입력해 주세요!");
            return;
        }

        const user_id = isUsername;
        const user_nickname = isUserNick;

        const replaceBase = async (html: string, images: { file: File; blobUrl: string }[]) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const imgTags = Array.from(doc.querySelectorAll("img"));

            for (const img of imgTags) {
                const src = img.getAttribute("src");
                const match = images.find(({ blobUrl }) => blobUrl === src);

                if (match) {
                    const file = match.file;
                    const fileName = encodeURIComponent(file.name);
                    const presignedRes = await axios.get(`/api/upload/${fileName}`);
                    const { url, fileUrl } = presignedRes.data;

                    await fetch(url, {
                        method: "PUT",
                        headers: { "Content-Type": file.type },
                        body: file,
                    });

                    img.setAttribute("src", fileUrl);
                }
            }

            return doc.body.innerHTML;
        };

        const content = await replaceBase(editorContent, imageFiles);

        try {

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
                router.push(`/board/${boardInfo.url_slug}`);
            }
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        if (isUsername === null) {
            alert("로그인이 필요합니다!");
            router.push("/login");
        }
    }, [isUsername, router]);

    if (isUsername === null) {
        return null;
    }

    return (
        <sub className="sub">
            <form onSubmit={(e) => { e.preventDefault(); posting(); }} className="write">
                <select className='board_category' onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const selectedBoard = boardData.boards.rows.find((b: { board_name: string; url_slug: string }) => b.url_slug === e.target.value);
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
                    {boardData && boardData?.boards?.rows.map((b: { board_name: string, url_slug: string }) => (
                        <option key={b.board_name} value={b.url_slug}>
                            {b.board_name}
                        </option>
                    ))}
                </select>
                <div className="write_top">
                    <input type="text" ref={writeTitle} placeholder='제목을 입력해 주세요.' />
                </div>

                <Editor editorContent={editorContent} setEditorContent={setEditorContent} imageFiles={imageFiles} setImageFiles={setImageFiles} />

                <div className='btn_wrap'>
                    <button type='submit'>POSTING</button>
                </div>

            </form>
        </sub>
    )
}