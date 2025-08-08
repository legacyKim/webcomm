"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface Board {
  id: number;
  board_name: string;
  url_slug: string;
  notice?: string;
  popularityScore?: number;
}

interface MenuCustom {
  id: number;
  board_id: number;
  priority: number;
  is_visible: boolean;
  board: Board;
}

interface MenuContextType {
  boards: Board[];
  menuCustoms: MenuCustom[];
  mainMenus: Board[];
  normalMenus: Board[];
  hiddenMenus: Board[];
  setBoards: (boards: Board[]) => void;
  setMenuCustoms: (customs: MenuCustom[]) => void;
  // refreshMenuData: () => Promise<void>;
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: ReactNode;
  initialBoards?: Board[];
  initialMenuCustoms?: MenuCustom[];
}

export function MenuProvider({
  children,
  initialBoards = [],
  initialMenuCustoms = [],
}: MenuProviderProps) {
  const { isUserId } = useAuth();
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [menuCustoms, setMenuCustoms] =
    useState<MenuCustom[]>(initialMenuCustoms);
  const [isLoading] = useState(false);

  // 로그인하지 않은 사용자를 위한 인기도 기반 게시판 데이터 로드
  useEffect(() => {
    if (!isUserId && boards.length === 0) {
      const loadPopularityBasedBoards = async () => {
        try {
          const response = await fetch("/api/board");
          if (response.ok) {
            const data = await response.json();
            // API는 { boards: [...] } 구조로 반환
            setBoards(data.boards || []);
          }
        } catch (error) {
          console.error("게시판 로드 실패:", error);
        }
      };
      loadPopularityBasedBoards();
    }
  }, [isUserId, boards.length]);

  // 사용자가 로그인했을 때 메뉴 커스텀 데이터 로드
  useEffect(() => {
    if (isUserId) {
      const loadUserMenuCustoms = async () => {
        try {
          const response = await fetch(`/api/menu-custom?userId=${isUserId}`);
          if (response.ok) {
            const data = await response.json();
            setMenuCustoms(data.menuCustoms || []);
          }
        } catch (error) {
          console.error("사용자 메뉴 설정 로드 실패:", error);
        }
      };
      loadUserMenuCustoms();
    } else {
      // 로그아웃 시 메뉴 커스텀 데이터 초기화
      setMenuCustoms([]);
    }
  }, [isUserId]);

  // 메뉴 분류 계산
  const categorizeMenus = (allBoards: Board[], customMenus: MenuCustom[]) => {
    const main: Board[] = [];
    const normal: Board[] = [];
    const hidden: Board[] = [];

    // 안전한 배열 처리
    if (!Array.isArray(allBoards)) {
      console.error("allBoards is not an array:", allBoards);
      return { main, normal, hidden };
    }

    const safeCustomMenus = Array.isArray(customMenus) ? customMenus : [];

    // 로그인하지 않은 사용자의 경우 인기도 기반 정렬
    if (!isUserId) {
      // 인기도 점수가 있는 경우 이미 정렬되어 있음
      const top8Boards = allBoards.slice(0, 8);
      const remainingBoards = allBoards.slice(8);

      return {
        main: top8Boards,
        normal: remainingBoards,
        hidden: [],
      };
    }

    // 로그인한 사용자의 경우 기존 로직 사용
    allBoards.forEach((board) => {
      const customMenu = safeCustomMenus.find(
        (menu) => menu.board_id === board.id
      );

      if (customMenu) {
        if (!customMenu.is_visible) {
          hidden.push(board);
        } else if (customMenu.priority >= 1 && customMenu.priority <= 8) {
          main.push(board);
        } else {
          normal.push(board);
        }
      } else {
        // 기본값: 보통 메뉴
        normal.push(board);
      }
    });

    // 메인 메뉴는 priority 순으로 정렬 (로그인한 사용자만)
    main.sort((a, b) => {
      const aCustom = safeCustomMenus.find((menu) => menu.board_id === a.id);
      const bCustom = safeCustomMenus.find((menu) => menu.board_id === b.id);
      return (aCustom?.priority || 0) - (bCustom?.priority || 0);
    });

    return { main, normal, hidden };
  };

  const {
    main: mainMenus,
    normal: normalMenus,
    hidden: hiddenMenus,
  } = categorizeMenus(boards, menuCustoms);

  // const refreshMenuData = async () => {
  //   setIsLoading(true);
  //   try {
  //     // 여기서는 boards만 새로고침 (menuCustoms는 사용자별이므로 별도 처리)
  //     const response = await fetch("/api/boards");
  //     if (response.ok) {
  //       const data = await response.json();
  //       setBoards(data.boards || []);
  //     }
  //   } catch (error) {
  //     console.error("메뉴 데이터 새로고침 실패:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const contextValue: MenuContextType = {
    boards,
    menuCustoms,
    mainMenus,
    normalMenus,
    hiddenMenus,
    setBoards,
    setMenuCustoms,
    // refreshMenuData,
    isLoading,
  };

  return (
    <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
