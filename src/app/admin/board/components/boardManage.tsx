"use client";

import { Board, Posts } from "../../../type/type";

import { useQuery } from "@tanstack/react-query";
import { fetchBoard, fetchPost } from '../../../api/api';

import { useState } from "react";
import BoardManagePopup from './popup/boardManagePopup'

export default function BoardManage({ section }: { section: string }) {

    const { data: boardData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });
    // const { data: postData, isLoading: postLoading } = useQuery({ queryKey: ["postData"], queryFn: fetchPost });

    const [popupOpen, setPopupOpen] = useState<boolean>(false);
    const [popupCorr, setPopupCorr] = useState<{ id: number, seq: number, board_name: string, url_slug: string }>({ id: 0, seq: 0, board_name: "", url_slug: "" });
    const [popupOption, setPopupOption] = useState<string>("")

    return (
        <div className="admin_content_wrap">
            <div className="admin_title">
                <h4>게시판 관리</h4>
                <div className="admin_btn">
                    <button onClick={() => { setPopupOpen(true); setPopupCorr({ id: 0, seq: 0, board_name: "", url_slug: "" }); setPopupOption("save"); }}>게시판 추가</button>
                </div>
            </div>
            <div className="admin_content">
                <ol className="table">
                    <li className="table_header">
                        <span>순서</span>
                        <span>게시판</span>
                        <span>URL</span>
                        <span>게시물 총합</span>
                        <span>게시물 총 조회수</span>
                        <span>관리</span>
                    </li>
                    {!isLoading &&
                        boardData.boards.rows.map((b: Board, i: number) => (
                            <li key={b.id}>
                                <span>{b.seq}</span>
                                <span>{b.board_name}</span>
                                <span>{b.url_slug}</span>
                                <span>게시물 총합</span>
                                <span>게시물 총 조회수</span>
                                <span>
                                    <button onClick={() => { setPopupOpen(!popupOpen); setPopupCorr({ id: b.id, seq: b.seq, board_name: b.board_name, url_slug: b.url_slug }); setPopupOption("corr"); }}>수정</button>
                                    <button>닫기</button>
                                    <button>삭제</button>
                                </span>
                            </li>
                        ))
                    }

                </ol>
            </div>

            {popupOpen && <BoardManagePopup setPopupOpen={setPopupOpen} boardData={boardData} popupCorr={popupCorr} popupOption={popupOption} />}

        </div>
    )
}