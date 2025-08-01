"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Menu({
  boardList,
}: {
  boardList?: { boards: { board_name: string; url_slug: string; id: number }[] };
}) {
  const pathname = usePathname();
  const { setBoardType, isUserId } = useAuth();
  const [showToggleMenu, setShowToggleMenu] = useState(false);
  const [customMenus, setCustomMenus] = useState<any[]>([]);
  const [hasCustomMenus, setHasCustomMenus] = useState(false);

  if (["/login", "/user", "/find", "/agree"].includes(pathname)) return null;

  // 베스트 게시판 (고정)
  const bestBoard = {
    board_name: "베스트 게시글",
    url_slug: "popular",
    id: 0,
    isFixed: true,
  };

  // 자유게시판 찾기
  const freeBoard = boardList?.boards?.find((board) => board.board_name === "자유게시판" || board.url_slug === "free");

  // 커스텀 메뉴는 로그인 한 유저에 한정해서 정해짐. 만약 커스텀 메뉴가 없을 시 보여줄 메뉴는
  // 베스트 게시판, 자유 게시판, 유머 게시판 <- 이 3가지가 공통 게시판, 나머지는 가장 활성화된 게시판을 보여줘야할 듯
  // 가장 활성화된 게시판은 게시물과 조회수가 가장 많은 게시판인데 (해당 게시판의 전체 조회수 / 전체 게시물 수) 로 하면 될 듯 <- 이 기준은 추후에도 변경 가능
  // 이 수식의 기준은 개별 게시물당 평균 조회수임.게시물이 많아도 조회수가 적을 수 있는데.. 사실 이는 실속이 없음을 의미하기 때문에...
  // 그래서 총 8개의 게시판을 최초로 보여줌.
  // 나머지 게시판은 아래 자동으로 정렬. <- 커스텀이 없다면 위 기준에 따라 정렬하면 될 듯

  // 로그인 한 경우 커스텀 메뉴를 구성할 수 있는데 최초의 커스텀 메뉴는 정해짐. 이는 마이페이지에서 구성.

  // 기본 메뉴 구성 (커스텀 메뉴가 없을 때)
  const defaultPrimaryMenus = [bestBoard, ...(freeBoard ? [freeBoard] : [])];

  // 전체 게시판에서 자유게시판 제외한 나머지
  const otherBoards = boardList?.boards?.filter((board) => board.id !== freeBoard?.id) || [];

  // 커스텀 메뉴가 있는 경우와 없는 경우 분기
  const primaryMenus = hasCustomMenus ? customMenus : defaultPrimaryMenus;
  const toggleMenus = hasCustomMenus
    ? otherBoards.filter((board) => !customMenus.some((custom) => custom.id === board.id))
    : otherBoards;

  // 토글 메뉴 버튼 클릭 핸들러
  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowToggleMenu(!showToggleMenu);
  };

  // 메뉴 설정 페이지로 이동
  const handleMenuSettings = () => {
    // TODO: 메뉴 설정 페이지 구현 후 링크 추가
    console.log("메뉴 설정하기 클릭");
  };

  return (
    <menu className='menu'>
      <div
        onClick={() => {
          setBoardType("board");
        }}>
        <div className='menu_list_top'>
          {/* 커스텀 메뉴가 없을 때는 기본 메뉴 2개를 순차적으로 보여줌. - 베스트 게시판, 자유 게시판 */}
          {/* 커스텀 메뉴가 있으면 커스텀 메뉴를 우선 보여줌. */}
          <ul className='menu_list page'>
            {primaryMenus.map((menu) => (
              <li key={menu.url_slug || menu.id}>
                <Link href={`/board/${menu.url_slug}`} className={menu.isFixed ? "menu-fixed" : ""}>
                  {menu.board_name}
                </Link>
              </li>
            ))}

            <div className='menu_custom_btn'>
              {/* 로그인한 사용자에게만 메뉴 설정 버튼 표시 */}

              {/* 토글 메뉴가 있을 때만 토글 버튼 표시 */}
              {toggleMenus.length > 0 && (
                <button className={`toggle_menu_btn ${showToggleMenu ? "active" : ""}`} onClick={handleToggleMenu}>
                  전체 메뉴 보기
                </button>
              )}
            </div>
          </ul>
        </div>

        {/* 토글 메뉴, 전체 메뉴가 들어오는 곳임. */}
        {showToggleMenu && toggleMenus.length > 0 && (
          <div className='menu_list_all'>
            <ul className='menu_list page'>
              {/* 만약 커스텀한 메뉴가 있다면 전체 메뉴 중 커스텀 한 메뉴를 제외한 나머지 메뉴만을 보여줌. */}
              {toggleMenus.map((board) => (
                <li key={board.id}>
                  <Link href={`/board/${board.url_slug}`}>{board.board_name}</Link>
                </li>
              ))}

              {/* 로그인한 사용자에게 메뉴 설정 링크 추가 */}
              {isUserId && <button onClick={handleMenuSettings}>메뉴 설정</button>}
            </ul>
          </div>
        )}
      </div>
    </menu>
  );
}
