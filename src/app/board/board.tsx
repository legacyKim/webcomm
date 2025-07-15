"use client";
// import Image from "next/image";

import Link from "next/link";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import Search from "@/components/search";
import Boardlist from "@/board/boardlist";

import { useAuth } from "@/AuthContext";

import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface Board {
  board_name: string;
  posts: Array<{ title: string; content: string }>;
}

export default function Board({ url_slug, boardType }: { url_slug: string; boardType: string }) {
  const { isUserId, setBoardType, setRedirectPath } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setRedirectPath(pathname);
  }, []);

  useEffect(() => {
    setBoardType(boardType);
  }, [boardType]);

  const [limit, setLimit] = useState(10);

  return (
    <sub className='sub'>
      <Search />

      <div className='board_single'>
        {/* board best */}
        <div className='board'>
          <div className='board_top'>
            {isUserId !== null && (
              <select onChange={(e) => setLimit(Number(e.target.value))} value={limit}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            )}

            {isUserId !== null && (
              <div>
                <Link href='/write'>
                  <PencilSquareIcon className='icon' />
                  <span>글쓰기</span>
                </Link>
              </div>
            )}
          </div>

          <Boardlist url_slug={url_slug as string} boardType={boardType} limit={limit as number} />
        </div>
      </div>
    </sub>
  );
}
