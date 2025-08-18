import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

// 계정 잠금 해제 (관리자 전용)
export async function POST(request) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "사용자 ID와 액션이 필요합니다.",
        },
        { status: 400 }
      );
    }

    let updateData = {};

    switch (action) {
      case "unlock":
        // 계정 잠금 해제
        updateData = {
          account_locked_until: null,
          failed_login_attempts: 0,
          last_failed_login: null,
          permanent_lock: false,
        };
        break;

      case "reset_attempts":
        // 실패 횟수만 초기화
        updateData = {
          failed_login_attempts: 0,
          last_failed_login: null,
        };
        break;

      case "reset_lock_count":
        // 잠금 횟수 초기화
        updateData = {
          lock_count: 0,
          account_locked_until: null,
          failed_login_attempts: 0,
          last_failed_login: null,
          permanent_lock: false,
        };
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "유효하지 않은 액션입니다.",
          },
          { status: 400 }
        );
    }

    const updatedUser = await prisma.member.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        username: true,
        user_nickname: true,
        account_locked_until: true,
        failed_login_attempts: true,
        lock_count: true,
        permanent_lock: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "계정 상태가 업데이트되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Account unlock error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 잠긴 계정 목록 조회 (관리자 전용)
export async function GET() {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const now = new Date();

    // 잠긴 계정들 조회
    const lockedAccounts = await prisma.member.findMany({
      where: {
        OR: [
          { permanent_lock: true },
          { account_locked_until: { gt: now } },
          { failed_login_attempts: { gte: 5 } }, // 5회 이상 실패한 계정도 포함
        ],
      },
      select: {
        id: true,
        username: true,
        user_nickname: true,
        email: true,
        account_locked_until: true,
        failed_login_attempts: true,
        last_failed_login: true,
        lock_count: true,
        permanent_lock: true,
        createdAt: true,
      },
      orderBy: { last_failed_login: "desc" },
    });

    return NextResponse.json({
      success: true,
      accounts: lockedAccounts,
    });
  } catch (error) {
    console.error("Get locked accounts error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
