import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

export async function POST(req: Request) {
  try {
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { boardId, direction } = await req.json();

    if (!boardId || !direction || !["up", "down"].includes(direction)) {
      return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
    }

    // 현재 게시판 정보 가져오기
    const currentBoard = await prisma.board.findUnique({
      where: { id: boardId },
      select: { seq: true },
    });

    if (!currentBoard) {
      return NextResponse.json(
        { error: "게시판을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const currentSeq = currentBoard.seq;

    // 교체할 게시판 찾기
    const targetBoard = await prisma.board.findFirst({
      where: {
        seq: direction === "up" ? currentSeq - 1 : currentSeq + 1,
      },
      select: { id: true, seq: true },
    });

    if (!targetBoard) {
      return NextResponse.json(
        { error: "이동할 위치가 없습니다" },
        { status: 400 }
      );
    }

    // 순서 교체 (트랜잭션 사용)
    await prisma.$transaction([
      // 임시로 seq를 -1로 설정 (중복 방지)
      prisma.board.update({
        where: { id: boardId },
        data: { seq: -1 },
      }),
      // 대상 게시판을 현재 위치로
      prisma.board.update({
        where: { id: targetBoard.id },
        data: { seq: currentSeq },
      }),
      // 현재 게시판을 대상 위치로
      prisma.board.update({
        where: { id: boardId },
        data: { seq: targetBoard.seq },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "게시판 순서가 변경되었습니다",
    });
  } catch (error) {
    console.error("Board move error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
