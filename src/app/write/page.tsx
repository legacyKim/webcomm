"use client";

import axios from 'axios';

import { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from '../api/api';

import Editor from './Editor';
import { useAuth } from '../AuthContext'

export default function Write() {

    const { isUsername, isUserNick } = useAuth();
    const router = useRouter();

    const { data: boardData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

    const writeTitle = useRef<HTMLInputElement>(null);
    const [editorContent, setEditorContent] = useState<string>('');

    const [boardInfo, setBoardInfo] = useState<{ board_name: string; url_slug: string }>({ board_name: "", url_slug: "" });

    const posting = async () => {

        const boardname = boardInfo.board_name;
        const url_slug = boardInfo.url_slug;

        if (boardname === "선택") {
            alert("카테고리를 선택해 주세요!");
            return;
        }

        const user_id = isUsername;
        const user_nickname = isUserNick;
        const title = writeTitle.current?.value;

        if (title === "") {
            alert("제목을 입력해 주세요!");
            return;
        }

        const content = editorContent;

        try {
            const response = await axios.post("/api/write", {
                boardname,
                url_slug,
                user_id,
                user_nickname,
                title,
                content
            });

            if (response.data.success) {
                alert("게시글 등록이 성공했습니다!");
                router.push(`/board/${boardInfo.url_slug}`)
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
                    <input type="text" ref={writeTitle} />
                </div>

                <Editor editorContent={editorContent} setEditorContent={setEditorContent} />

                <div className='btn_wrap'>
                    <button type='submit'>POSTING</button>
                </div>

            </form>
        </sub>
    )
}