"use client";
 
// import { useQuery } from "@tanstack/react-query";
// import { fetchBoard } from '../../../api/api';

export default function BoardConManage() {

    // const { data, isLoading } = useQuery("boardData", fetchBoard);

    return (
        <div className="admin_content_wrap">
            <div className="admin_title">
                <h4>게시글 보관</h4>
            </div>
            <div className="admin_content">

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
                    <li>
                        <span>1</span>
                        <span className="table_board">연애</span>
                        <span className="table_title">요즘 연애의 문제</span>
                        <span className="table_content">젊은 애들이 너무 자유에 찌들어 어쩌구 저쩌구</span>
                        <span>bamy</span>
                        <span>20,000</span>
                        <span>390,000</span>
                        <span>1,000</span>
                        <span>13</span>
                        <span className="table_date">2025.02.18 19:39:32</span>
                        <span className="table_btn">
                            <button>복구</button>
                            <button>삭제</button>
                        </span>
                    </li>
                </ol>
            </div>
        </div>
    )
}