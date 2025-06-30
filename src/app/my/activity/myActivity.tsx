"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

export default function MyActivity() {
  const pathname = usePathname();

  return (
    <>
      <div className='mypage_list_sub'>
        <Link href='/my/activity/post' className={`${pathname === "/my/activity/post" ? "active" : ""}`}>
          내가 쓴 글
        </Link>
        <Link href='/my/activity/comment' className={`${pathname === "/my/activity/comment" ? "active" : ""}`}>
          내가 쓴 댓글
        </Link>
        <Link href='/my/activity/like-post' className={`${pathname === "/my/activity/like-post" ? "active" : ""}`}>
          공감한 글
        </Link>
        <Link
          href='/my/activity/like-comment'
          className={`${pathname === "/my/activity/like-comment" ? "active" : ""}`}>
          공감한 댓글
        </Link>
      </div>
    </>
  );
}
