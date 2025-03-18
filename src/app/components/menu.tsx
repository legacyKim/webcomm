"use client";

import Link from 'next/link';
import { usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from '../api/api';

export default function Menu() {

    const { data: boardData, isLoading } = useQuery({ queryKey: ["boardData"], queryFn: fetchBoard });

    const pathname = usePathname();

    if (pathname === "/login" || pathname === "/user") return null;

    return (
        <menu className="menu">
            <ul className="menu_list page">
                {boardData && boardData?.boards?.rows.map((b: { board_name: string, url_slug: string }) => (
                    <li key={b.board_name}>
                        <Link href={`/board/${b.url_slug}`}>{b.board_name}</Link>
                    </li>
                ))}
            </ul>
        </menu>
    )
}