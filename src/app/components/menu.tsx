"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/AuthContext";

import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/api/api";

export default function Menu() {
  const pathname = usePathname();

  const { data: boardData } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });
  const { setBoardType } = useAuth();

  if (pathname === "/login" || pathname === "/user" || pathname === "/find" || pathname === "/agree") return null;

  return (
    <menu className='menu'>
      <ul className='menu_list page'>
        {boardData &&
          boardData?.boards?.map((b: { board_name: string; url_slug: string }) => (
            <li key={b.board_name}>
              <Link
                href={`/board/${b.url_slug}`}
                onClick={() => {
                  setBoardType("board");
                }}>
                {b.board_name}
              </Link>
            </li>
          ))}
      </ul>
    </menu>
  );
}
