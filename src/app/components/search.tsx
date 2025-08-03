"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/AuthContext";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const { setBoardType } = useAuth();

  const handleSearch = async () => {
    setBoardType("search");
    if (!keyword.trim()) {
      alert("검색어를 입력해 주세요.");
      return;
    }
    // URL 인코딩 추가하여 한글 및 특수문자 처리
    const encodedKeyword = encodeURIComponent(keyword.trim());
    router.push(`/board/search/${encodedKeyword}`);
  };

  return (
    <div className='search page'>
      <input
        type='text'
        placeholder='검색어를 입력해 주세요.'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button className='btn-icon' onClick={handleSearch}>
        <i className='icon-search'></i>
      </button>
    </div>
  );
}
