"use client";

import { useState, useEffect } from "react";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/contexts/MenuContext";
import Link from "next/link";

import { BarsArrowDownIcon } from "@heroicons/react/24/outline";

export default function Menu() {
  const pathname = usePathname();
  const { setBoardType } = useAuth();
  const { mainMenus, normalMenus } = useMenu();
  const [showToggleMenu, setShowToggleMenu] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu_custom_btn")) {
        setShowToggleMenu(false);
      }
    };

    if (showToggleMenu) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showToggleMenu]);

  // 현재 경로에 따른 게시판 타입 설정
  useEffect(() => {
    const pathSegments = pathname.split("/");
    if (pathSegments[1] === "board" && pathSegments[2]) {
      setBoardType(pathSegments[2]);
    }
  }, [pathname, setBoardType]);

  const toggleMenu = () => {
    setShowToggleMenu(!showToggleMenu);
  };

  return (
    <div className="menu">
      <div className="menu_list ">
        <div className="menu_list_top page">
          {/* 메인 메뉴 표시 */}
          <div className="menu_list_main">
            {mainMenus.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.url_slug}`}
                className={
                  pathname === `/board/${board.url_slug}` ? "active" : ""
                }
              >
                {board.board_name}
              </Link>
            ))}
          </div>

          {normalMenus.length > 0 && (
            <div className="menu_custom_btn">
              <button
                onClick={toggleMenu}
                className={showToggleMenu ? "active" : ""}
              >
                <BarsArrowDownIcon className="icon" />
              </button>
            </div>
          )}
        </div>

        <div
          className={`menu_custom_dropdown ${showToggleMenu ? "active" : ""}`}
        >
          <div className="menu_list page">
            {normalMenus.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.url_slug}`}
                className={
                  pathname === `/board/${board.url_slug}` ? "active" : ""
                }
                onClick={() => setShowToggleMenu(false)}
              >
                {board.board_name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
