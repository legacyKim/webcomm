"use client";

export default function BoardPopup({ section, setPopupOpen }: { section: string, setPopupOpen: (value: boolean) => void }) {

    return (
        <div className="admin_popup_bg">
            <div className="admin_popup">

                <div className="admin_popup_header">
                    <h6></h6>
                    <button onClick={() => { setPopupOpen(false); }}><i className="icon-cancel"></i></button>
                </div>

                <div className="admin_popup_footer">
                    <button onClick={() => { setPopupOpen(false); }}>저장</button>
                </div>
            </div>
        </div>
    )

}