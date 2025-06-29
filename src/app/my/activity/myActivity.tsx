"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function MyActivity() {
  const pathname = usePathname();

  const [myActiveMenu, setMyActiveMenu] = useState<string>("정보");

  useEffect(() => {
    if (pathname === "/my/activity/post") {
      setMyActiveMenu("내가 쓴 글");
    } else if (pathname === "/my/activity/comment") {
      setMyActiveMenu("내가 쓴 댓글");
    } else if (pathname === "/my/activity/like-post") {
      setMyActiveMenu("공감한 글");
    } else if (pathname === "/my/activity/like-comment") {
      setMyActiveMenu("공감한 댓글");
    }
  }, [pathname]);

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
