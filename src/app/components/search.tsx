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
    router.push(`/board/search/${keyword}`);
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
