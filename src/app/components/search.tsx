"use client";

export default function Search() {
    
    return (
        <div className="search page">
            <input type="text" placeholder="검색어를 입력해 주세요." />
            <button className="btn-icon">
                <i className="icon-search"></i>
            </button>
        </div>
    )
}