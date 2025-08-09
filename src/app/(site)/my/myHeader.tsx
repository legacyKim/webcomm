"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import {
  InformationCircleIcon,
  ListBulletIcon,
  BellIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

export default function MyHeader() {
  const { isUserNick } = useAuth();

  const pathname = usePathname();
  const [mypageMenu, setMypageMenu] = useState<string>("정보");

  useEffect(() => {
    if (pathname === "/my") {
      setMypageMenu("정보를");
    } else if (pathname.includes("/my/activity")) {
      setMypageMenu("활동 내역을");
    } else if (pathname === "/my/message") {
      setMypageMenu("쪽지를");
    } else if (pathname === "/my/notice") {
      setMypageMenu("알림 메세지를");
    } else if (pathname === "/my/blocked") {
      setMypageMenu("차단한 유저를");
    } else if (pathname === "/my/following") {
      setMypageMenu("팔로우 목록을");
    } else if (pathname === "/my/menu-settings") {
      setMypageMenu("메뉴 설정을");
    }
  }, [pathname]);

  return (
    <>
      <div className="section_top">
        <h4 className="title">{isUserNick}님의 계정</h4>
        <p className="notice">회원님의 {mypageMenu} 확인하실 수 있습니다.</p>
      </div>

      <div className="mypage_list">
        <Link href="/my" className={`${pathname === "/my" ? "active" : ""}`}>
          <InformationCircleIcon className="icon" />
          계정 정보
        </Link>
        <Link
          href="/my/activity/post"
          className={`${pathname.includes("/my/activity") ? "active" : ""}`}
        >
          <ListBulletIcon className="icon" />
          활동 내역
        </Link>
        <Link
          href="/my/notice"
          className={`${pathname === "/my/notice" ? "active" : ""}`}
        >
          <BellIcon className="icon" />
          알림
        </Link>
        <Link
          href="/my/message"
          className={`${pathname === "/my/message" ? "active" : ""}`}
        >
          <EnvelopeIcon className="icon" />
          쪽지함
        </Link>
        <Link
          href="/my/blocked"
          className={`${pathname === "/my/blocked" ? "active" : ""}`}
        >
          <ExclamationTriangleIcon className="icon" />
          차단
        </Link>
        <Link
          href="/my/following"
          className={`${pathname === "/my/following" ? "active" : ""}`}
        >
          <UserPlusIcon className="icon" />
          팔로우
        </Link>
        <Link
          href="/my/menu-settings"
          className={`${pathname === "/my/menu-settings" ? "active" : ""}`}
        >
          <Cog6ToothIcon className="icon" />
          메뉴 설정
        </Link>
      </div>
    </>
  );
}
