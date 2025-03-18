"use client";

export default function BoardConManagePopup({ section, setPopupOpen }: { section: string, setPopupOpen: (value: boolean) => void }) {

    return (
        <div className="admin_popup_bg">
            <div className="admin_popup">

                <div className="admin_popup_header">
                    <h6>게시글 조회</h6>
                    <button onClick={() => { setPopupOpen(false); }}><i className="icon-cancel"></i></button>
                </div>

                <div className="admin_popup_content">
                    <div className="admin_popup_board_header">
                        <b className="category">카테고리</b>
                        <h4 className="view_title">타이틀</h4>
                        <div className="view_info">
                            <span className="writer"><i></i>홍길동</span>
                            <span className="view"><i></i>2000</span>
                            <span className="date"><i></i>2024.05.24</span>
                            <span className="like"><i></i>23</span>
                            <span className="comment"><i></i>24</span>
                        </div>
                    </div>
                    <div className="admin_popup_board_content">
                        내용
                        내용
                        내용
                        내용
                        내용
                        내용
                        내용
                        내용
                        내용
                        내용
                    </div>
                </div>

                <div className="admin_popup_footer">
                    <button onClick={() => { setPopupOpen(false); }}>저장</button>
                </div>
            </div>
        </div>

    )

}