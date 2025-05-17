"use client";

import axios from 'axios';

import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from '../../api/api';

import Editor from '../Editor';
import { useAuth } from '../../AuthContext'

import { Posts } from '../../type/type';
import { ImageWithBlob } from '../../type/type';

export default function Write() {

    const { isUsername, isUserNick } = useAuth();
    const router = useRouter();

    const { id } = useParams();

    const { data: boardData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

    const writeTitle = useRef<HTMLInputElement>(null);
    const [editorContent, setEditorContent] = useState<string>('');

    console.log(editorContent);

    const [imageFiles, setImageFiles] = useState<ImageWithBlob[]>([]);
    const [boardInfo, setBoardInfo] = useState<{ board_name: string; url_slug: string }>({ board_name: "", url_slug: "" });

    const [writeData, setWriteData] = useState<Posts | null>(null);

    console.log(writeData);

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
            const response = await axios.put(`/api/write/${id}`, {
                id,
                boardname,
                url_slug,
                user_id,
                user_nickname,
                title,
                content
            });

            if (response.data.success) {
                alert("게시글이 수정됐습니다!");
                router.push(`/board/${boardInfo.url_slug}/${id}`)
            }

        } catch (error) {
            console.log(error);
        }

    }

    // useEffect(() => {
    //     if (isUsername === null) {
    //         alert("로그인이 필요합니다!");
    //         router.push("/login");
    //     }
    // }, [isUsername, router]);

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
        return <div>Loading...</div>;
    }

    return (
        <sub className="sub">
            <form onSubmit={(e) => { e.preventDefault(); postCorrecting(); }} className="write">

                <select className='board_category' value={boardInfo.url_slug} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
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
                
                <Editor editorContent={editorContent} setEditorContent={setEditorContent} imageFiles={imageFiles} setImageFiles={setImageFiles} />

                <div className='btn_wrap'>
                    <button type='submit'>글 수정하기</button>
                </div>

            </form>
        </sub>
    )
}