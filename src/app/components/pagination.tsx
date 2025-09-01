"use client";

import Link from "next/link";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Pagination({
  page,
  totalPage,
  type,
  url_slug,
  cate,
}: {
  page: number;
  totalPage: number;
  type: string;
  url_slug?: string | null;
  cate?: string | null;
}) {
  const getPageLink = (p: number) => {
    if (type === "board" && url_slug) return `/board/${url_slug}?page=${p}`;
    if (type === "userPosts" && url_slug)
      return `/board/post/${url_slug}?page=${p}`;
    if (type === "userComments" && url_slug)
      return `/board/comment/${url_slug}?page=${p}`;
    if (type === "search" && url_slug)
      return `/board/search/${url_slug}?page=${p}`;
    if (type === "popular") return `/board/popular?page=${p}`;
    if (type === "my") return `/my/activity/${cate}?page=${p}`;
    if (type === "notifications") return `?page=${p}`;
    return `?page=${p}`;
  };

  const pageButtons = [...Array(totalPage)]
    .map((_, index) => index + 1)
    .slice(Math.max(0, page - 5), page + 5);

  return (
    <div className="pagination">
      <Link href={getPageLink(1)} aria-disabled={page === 1}>
        <ChevronDoubleLeftIcon className="icon" />
      </Link>
      <Link
        href={getPageLink(Math.max(page - 1, 1))}
        aria-disabled={page === 1}
      >
        <ChevronLeftIcon className="icon" />
      </Link>

      {pageButtons.map((p) => (
        <Link
          key={p}
          href={getPageLink(p)}
          className={page === p ? "active" : ""}
        >
          {p}
        </Link>
      ))}

      <Link
        href={getPageLink(Math.min(page + 1, totalPage))}
        aria-disabled={page === totalPage}
      >
        <ChevronRightIcon className="icon" />
      </Link>
      <Link href={getPageLink(totalPage)} aria-disabled={page === totalPage}>
        <ChevronDoubleRightIcon className="icon" />
      </Link>
    </div>
  );
}
