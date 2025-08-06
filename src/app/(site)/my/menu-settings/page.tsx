"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/contexts/MenuContext";
import MyHeader from "../myHeader";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/outline";

interface Board {
  id: number;
  board_name: string;
  url_slug: string;
}

export default function MenuSettingsPage() {
  const router = useRouter();
  const { isUserId } = useAuth();
  const {
    boards: contextBoards,
    mainMenus: contextMainMenus,
    normalMenus: contextNormalMenus,
    hiddenMenus: contextHiddenMenus,
    setMenuCustoms,
  } = useMenu();

  // Note: These variables are assigned but not used in current implementation
  // They may be needed for future functionality
  console.log("Debug - contextBoards:", contextBoards);

  const [loading] = useState(false);

  // 메뉴 타입별 분류 (로컬 상태)
  const [mainMenus, setMainMenus] = useState<Board[]>([]);
  const [normalMenus, setNormalMenus] = useState<Board[]>([]);
  const [hiddenMenus, setHiddenMenus] = useState<Board[]>([]);

  // 원본 데이터 (초기화용)
  const [originalMainMenus, setOriginalMainMenus] = useState<Board[]>([]);
  const [originalNormalMenus, setOriginalNormalMenus] = useState<Board[]>([]);
  const [originalHiddenMenus, setOriginalHiddenMenus] = useState<Board[]>([]);

  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    board: Board | null;
  }>({ visible: false, x: 0, y: 0, board: null });

  // 변경사항 추적
  const [hasChanges, setHasChanges] = useState(false);

  // 컨텍스트 메뉴 함수들
  const showContextMenu = (e: React.MouseEvent, board: Board) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      board: board,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, board: null });
  };

  // 전역 클릭 이벤트로 컨텍스트 메뉴 숨기기
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        hideContextMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible]);

  useEffect(() => {
    if (!isUserId) {
      router.push("/login");
      return;
    }
    // Context에서 데이터를 받아와서 초기 상태 설정
    setMainMenus([...contextMainMenus]);
    setNormalMenus([...contextNormalMenus]);
    setHiddenMenus([...contextHiddenMenus]);
    setOriginalMainMenus([...contextMainMenus]);
    setOriginalNormalMenus([...contextNormalMenus]);
    setOriginalHiddenMenus([...contextHiddenMenus]);
  }, [
    isUserId,
    router,
    contextMainMenus,
    contextNormalMenus,
    contextHiddenMenus,
  ]);

  const moveToMainMenu = (board: Board) => {
    if (mainMenus.length >= 8) {
      alert("메인 메뉴는 최대 8개까지만 설정 가능합니다.");
      return;
    }

    setMainMenus([...mainMenus, board]);
    setNormalMenus(normalMenus.filter((menu) => menu.id !== board.id));
    setHiddenMenus(hiddenMenus.filter((menu) => menu.id !== board.id));
    setHasChanges(true);
    hideContextMenu();
  };

  const moveToNormalMenu = (board: Board) => {
    setNormalMenus([...normalMenus, board]);
    setMainMenus(mainMenus.filter((menu) => menu.id !== board.id));
    setHiddenMenus(hiddenMenus.filter((menu) => menu.id !== board.id));
    setHasChanges(true);
    hideContextMenu();
  };

  const moveToHiddenMenu = (board: Board) => {
    setHiddenMenus([...hiddenMenus, board]);
    setMainMenus(mainMenus.filter((menu) => menu.id !== board.id));
    setNormalMenus(normalMenus.filter((menu) => menu.id !== board.id));
    setHasChanges(true);
    hideContextMenu();
  };

  const moveMainMenuUp = (index: number) => {
    if (index === 0) return;
    const newMainMenus = [...mainMenus];
    [newMainMenus[index], newMainMenus[index - 1]] = [
      newMainMenus[index - 1],
      newMainMenus[index],
    ];
    setMainMenus(newMainMenus);
    setHasChanges(true);
  };

  const moveMainMenuDown = (index: number) => {
    if (index === mainMenus.length - 1) return;
    const newMainMenus = [...mainMenus];
    [newMainMenus[index], newMainMenus[index + 1]] = [
      newMainMenus[index + 1],
      newMainMenus[index],
    ];
    setMainMenus(newMainMenus);
    setHasChanges(true);
  };

  // 초기 상태로 돌리기
  const resetToOriginal = () => {
    setMainMenus([...originalMainMenus]);
    setNormalMenus([...originalNormalMenus]);
    setHiddenMenus([...originalHiddenMenus]);
    setHasChanges(false);
  };

  const saveMenuSettings = async () => {
    try {
      const menuSettings = [
        ...mainMenus.map((board, index) => ({
          board_id: board.id,
          priority: index + 1,
          is_visible: true,
        })),
        ...normalMenus.map((board) => ({
          board_id: board.id,
          priority: 0,
          is_visible: true,
        })),
        ...hiddenMenus.map((board) => ({
          board_id: board.id,
          priority: 0,
          is_visible: false,
        })),
      ];

      await axios.post("/api/menu-custom", {
        userId: isUserId,
        menuSettings,
      });

      // 저장 성공 시 원본 데이터 업데이트 및 Context 업데이트
      setOriginalMainMenus([...mainMenus]);
      setOriginalNormalMenus([...normalMenus]);
      setOriginalHiddenMenus([...hiddenMenus]);
      setHasChanges(false);

      // Context 업데이트를 위해 메뉴 커스텀 데이터 갱신
      const response = await axios.get(`/api/menu-custom?userId=${isUserId}`);
      setMenuCustoms(response.data.menuCustoms || []);

      alert("메뉴 설정이 저장되었습니다.");
    } catch (error) {
      console.error("메뉴 설정 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <sub className="sub">
        <div className="mypage">
          <MyHeader />
          <div className="mypage_content">
            <div className="loading-container">
              <p>메뉴 설정을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </sub>
    );
  }

  return (
    <sub className="sub">
      <div className="mypage">
        <MyHeader />

        <div className="mypage_content">
          <div className="mypage_inner">
            <h2 className="mypage_title">메뉴 설정</h2>
            <p className="notice mb-12">
              원하는 메뉴를 선택하여 나만의 메뉴를 구성하세요. 메뉴를 우클릭하면
              메뉴 타입을 변경할 수 있습니다.
            </p>
            <ul className="menu_settings_info">
              <li>
                <strong>메인 메뉴</strong> 상단에 표시되는 메뉴로 최대 8개까지
                설정할 수 있습니다.
              </li>
              <li>
                <strong>보통 메뉴</strong> 상단 메뉴 영역에서 우측 아이콘 (메뉴
                더 보기 버튼) 을 클릭했을 시 보이는 메뉴입니다.
              </li>
              <li>
                <strong>숨김 메뉴</strong> 상단 메뉴 영역에서 메뉴를 숨길 수
                있습니다.
              </li>
            </ul>

            {/* 가로 정렬로 변경 */}
            <div className="menu_categories">
              {/* 메인 메뉴 */}
              <div className="menu_category">
                <h3>메인 메뉴 ({mainMenus.length}/8)</h3>
                <div className="menu_list_container">
                  {mainMenus.length === 0 ? (
                    <div className="empty_menu">
                      설정된 메인 메뉴가 없습니다.
                    </div>
                  ) : (
                    mainMenus.map((board, index) => (
                      <div
                        key={board.id}
                        className="menu-item menu_main_item"
                        onContextMenu={(e) => showContextMenu(e, board)}
                      >
                        <span>{board.board_name}</span>
                        <div className="menu_controls">
                          <button
                            onClick={() => moveMainMenuUp(index)}
                            disabled={index === 0}
                            className="move_btn"
                            title="위로 이동"
                          >
                            <ArrowLongLeftIcon className="icon" />
                          </button>
                          <button
                            onClick={() => moveMainMenuDown(index)}
                            disabled={index === mainMenus.length - 1}
                            className="move_btn"
                            title="아래로 이동"
                          >
                            <ArrowLongRightIcon className="icon" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 보통 메뉴 */}
              <div className="menu_category">
                <h3>보통 메뉴 ({normalMenus.length}개)</h3>
                <div className="menu_list_container">
                  {normalMenus.length === 0 ? (
                    <div className="empty_menu">
                      설정된 보통 메뉴가 없습니다.
                    </div>
                  ) : (
                    normalMenus.map((board) => (
                      <div
                        key={board.id}
                        className="menu-item normal"
                        onContextMenu={(e) => showContextMenu(e, board)}
                      >
                        <span>{board.board_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 숨김 메뉴 */}
              <div className="menu_category">
                <h3>숨김 메뉴 ({hiddenMenus.length}개)</h3>
                <div className="menu_list_container">
                  {hiddenMenus.length === 0 ? (
                    <div className="empty_menu">
                      설정된 숨김 메뉴가 없습니다.
                    </div>
                  ) : (
                    hiddenMenus.map((board) => (
                      <div
                        key={board.id}
                        className="menu-item hidden"
                        onContextMenu={(e) => showContextMenu(e, board)}
                      >
                        <span>{board.board_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 컨텍스트 메뉴 */}
            {contextMenu.visible && contextMenu.board && (
              <div
                className="context_menu"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                  position: "fixed",
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={() => moveToMainMenu(contextMenu.board!)}
                  disabled={
                    mainMenus.length >= 8 ||
                    mainMenus.some((m) => m.id === contextMenu.board!.id)
                  }
                  className="context_menu_item"
                >
                  메인 메뉴로 이동
                </button>
                <button
                  onClick={() => moveToNormalMenu(contextMenu.board!)}
                  disabled={normalMenus.some(
                    (m) => m.id === contextMenu.board!.id
                  )}
                  className="context_menu_item"
                >
                  보통 메뉴로 이동
                </button>
                <button
                  onClick={() => moveToHiddenMenu(contextMenu.board!)}
                  disabled={hiddenMenus.some(
                    (m) => m.id === contextMenu.board!.id
                  )}
                  className="context_menu_item"
                >
                  숨김 메뉴로 이동
                </button>
              </div>
            )}

            {/* 저장/초기화 버튼 */}
            <div className="menu_actions">
              <button
                onClick={resetToOriginal}
                disabled={!hasChanges}
                className="btn_reset"
              >
                원래 상태로 돌리기
              </button>
              <button
                onClick={saveMenuSettings}
                disabled={!hasChanges}
                className="btn_save"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </sub>
  );
}
