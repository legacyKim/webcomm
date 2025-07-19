"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/AuthContext";
import Link from "next/link";

export default function Menu({ boardList }: { boardList?: { boards: { board_name: string; url_slug: string }[] } }) {
  const pathname = usePathname();
  const { setBoardType } = useAuth();

  if (["/login", "/user", "/find", "/agree"].includes(pathname)) return null;

  return (
    <menu className='menu'>
      <div
        onClick={() => {
          setBoardType("board");
        }}>
        <ul className='menu_list page'>
          {boardList?.boards?.map((b: { board_name: string; url_slug: string }) => (
            <li key={b.board_name}>
              <Link href={`/board/${b.url_slug}`}>{b.board_name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </menu>
  );
}
