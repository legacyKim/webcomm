"use client";

import { Posts } from "../../../type/type";

import { useQuery } from "@tanstack/react-query";
import { fetchPost } from '../../../api/api';

import { useState } from "react";
import BoardConManagePopup from './popup/boardConManagePopup'

export default function BoardConManage({ section }: { section: string }) {

    const { data: postData, isLoading: postLoading } = useQuery({ queryKey: ["postData"], queryFn: fetchPost });

    const [popupOpen, setPopupOpen] = useState<boolean>(false);

    return (
        <div className="admin_content_wrap">
            <div className="admin_title">
                <h4>게시글 관리</h4>
            </div>
            <div className="admin_content">

                <div className="select_group">
                    <select>
                        <option value="">게시판 이름</option>
                    </select>

                    <button>조회하기</button>
                </div>

                <ol className="table">
                    <li className="table_header">
                        <span>No</span>
                        <span className="table_board">게시판</span>
                        <span className="table_title">제목</span>
                        <span className="table_content">내용</span>
                        <span>ID</span>
                        <span>조회수</span>
                        <span>좋아요</span>
                        <span>싫어요</span>
                        <span>신고</span>
                        <span className="table_date">날짜</span>
                        <span className="table_btn">관리</span>
                    </li>
                    {!postLoading &&
                        postData.posts.rows.map((p: Posts, i: number) => (
                            <li>
                                <span>{i}</span>
                                <span className="table_board">{p.board_name}</span>
                                <span className="table_title">{p.title}</span>
                                <span className="table_content">{String(p.content)}</span>
                                <span>{p.user_id}</span>
                                <span>{p.views}</span>
                                <span>{p.likes}</span>
                                <span>{p.dislike}</span>
                                <span>{p.reports}</span>
                                <span className="table_date">{new Date(p.created_at).toLocaleDateString()}</span>
                                <span className="table_btn">
                                    <button onClick={() => { setPopupOpen(true); }}>보기</button>
                                    <button>보관</button>
                                </span>
                            </li>
                        ))
                    }
                </ol>
            </div>

            {popupOpen && <BoardConManagePopup section={section} setPopupOpen={setPopupOpen} />}

        </div>
    )
}