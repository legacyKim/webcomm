import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

const prisma = new PrismaClient();

// GET: 사용자의 메뉴 커스텀 설정 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const menuCustoms = await prisma.$queryRaw`
      SELECT 
        mc.id,
        mc.user_id,
        mc.board_id,
        mc.priority,
        mc.is_visible,
        mc.created_at,
        mc.updated_at,
        b.id as "board.id",
        b.board_name as "board.board_name",
        b.url_slug as "board.url_slug"
      FROM menu_customs mc
      JOIN boards b ON mc.board_id = b.id
      WHERE mc.user_id = ${parseInt(userId)}
      ORDER BY mc.priority ASC, b.board_name ASC
    `;

    return NextResponse.json({
      success: true,
      menuCustoms,
    });
  } catch (error) {
    console.error("메뉴 커스텀 조회 오류:", error);
    return NextResponse.json(
      {
        error: "메뉴 설정을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// POST: 사용자의 메뉴 커스텀 설정 저장
export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const userData = await serverTokenCheck();

    if (!userData) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, menuSettings } = body;

    // 토큰의 사용자 ID와 요청의 사용자 ID가 일치하는지 확인
    if (userData.id !== parseInt(userId)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    if (!menuSettings || !Array.isArray(menuSettings)) {
      return NextResponse.json(
        { error: "메뉴 설정 데이터가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 트랜잭션으로 기존 설정 삭제 후 새로 저장
    await prisma.$transaction(async (tx) => {
      // 기존 메뉴 커스텀 설정 삭제
      await tx.$executeRaw`
        DELETE FROM menu_customs WHERE user_id = ${parseInt(userId)}
      `;

      // 새로운 메뉴 커스텀 설정 생성
      if (menuSettings.length > 0) {
        for (const setting of menuSettings) {
          await tx.$executeRaw`
            INSERT INTO menu_customs (user_id, board_id, priority, is_visible, created_at, updated_at)
            VALUES (${parseInt(userId)}, ${setting.board_id}, ${setting.priority}, ${setting.is_visible}, NOW(), NOW())
          `;
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "메뉴 설정이 저장되었습니다.",
    });
  } catch (error) {
    console.error("메뉴 커스텀 저장 오류:", error);
    return NextResponse.json(
      {
        error: "메뉴 설정을 저장하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// PUT: 개별 메뉴 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const userData = await serverTokenCheck();

    if (!userData) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, boardId, priority, isVisible } = body;

    if (userData.id !== parseInt(userId)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 기존 설정이 있는지 확인
    const existingCustom = (await prisma.$queryRaw`
      SELECT id FROM menu_customs 
      WHERE user_id = ${parseInt(userId)} AND board_id = ${parseInt(boardId)}
      LIMIT 1
    `) as { id: number }[];

    if (existingCustom.length > 0) {
      // 업데이트
      await prisma.$executeRaw`
        UPDATE menu_customs 
        SET priority = ${priority}, is_visible = ${isVisible}, updated_at = NOW()
        WHERE user_id = ${parseInt(userId)} AND board_id = ${parseInt(boardId)}
      `;
    } else {
      // 새로 생성
      await prisma.$executeRaw`
        INSERT INTO menu_customs (user_id, board_id, priority, is_visible, created_at, updated_at)
        VALUES (${parseInt(userId)}, ${parseInt(boardId)}, ${priority}, ${isVisible}, NOW(), NOW())
      `;
    }

    return NextResponse.json({
      success: true,
      message: "메뉴 설정이 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("메뉴 커스텀 업데이트 오류:", error);
    return NextResponse.json(
      {
        error: "메뉴 설정을 업데이트하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// DELETE: 특정 메뉴 커스텀 설정 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const userData = await serverTokenCheck();

    if (!userData) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const boardId = searchParams.get("boardId");

    if (!userId || !boardId) {
      return NextResponse.json(
        { error: "사용자 ID와 게시판 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (userData.id !== parseInt(userId)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    await prisma.$executeRaw`
      DELETE FROM menu_customs 
      WHERE user_id = ${parseInt(userId)} AND board_id = ${parseInt(boardId)}
    `;

    return NextResponse.json({
      success: true,
      message: "메뉴 설정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("메뉴 커스텀 삭제 오류:", error);
    return NextResponse.json(
      {
        error: "메뉴 설정을 삭제하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
