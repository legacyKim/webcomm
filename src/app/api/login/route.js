import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userid, password } = await req.json();

    // 사용자 조회
    const user = await prisma.member.findUnique({
      where: { username: userid },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "아이디가 없습니다.",
        },
        { status: 401 }
      );
    }

    // 계정 잠금 상태 확인
    const now = new Date();

    // 영구 잠금 확인
    if (user.permanent_lock) {
      return NextResponse.json(
        {
          success: false,
          message: "계정이 영구적으로 잠겨있습니다. 관리자에게 문의하세요.",
        },
        { status: 423 }
      );
    }

    // 임시 잠금 확인
    if (user.account_locked_until && user.account_locked_until > now) {
      const unlockTime = user.account_locked_until.toLocaleString("ko-KR");
      return NextResponse.json(
        {
          success: false,
          message: `계정이 잠겨있습니다. 잠금 해제 시간: ${unlockTime}`,
        },
        { status: 423 }
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // 로그인 실패 횟수 증가
      const failedAttempts = user.failed_login_attempts + 1;
      const lockCount = user.lock_count;

      let updateData = {
        failed_login_attempts: failedAttempts,
        last_failed_login: now,
      };

      // 10회 실패 시 계정 잠금 처리
      if (failedAttempts >= 10) {
        const newLockCount = lockCount + 1;

        if (newLockCount >= 3) {
          // 3번째 잠금 시 영구 잠금
          updateData.permanent_lock = true;
          updateData.lock_count = newLockCount;

          await prisma.member.update({
            where: { id: user.id },
            data: updateData,
          });

          return NextResponse.json(
            {
              success: false,
              message: "계정이 영구적으로 잠겨있습니다. 관리자에게 문의하세요.",
            },
            { status: 423 }
          );
        } else {
          // 24시간 임시 잠금
          updateData.account_locked_until = new Date(
            now.getTime() + 24 * 60 * 60 * 1000
          );
          updateData.lock_count = newLockCount;
          updateData.failed_login_attempts = 0; // 잠금 시 실패 횟수 초기화

          await prisma.member.update({
            where: { id: user.id },
            data: updateData,
          });

          return NextResponse.json(
            {
              success: false,
              message: `로그인을 10회 실패하여 계정이 24시간 잠겼습니다. (${newLockCount}/3회 잠금)`,
            },
            { status: 423 }
          );
        }
      } else {
        // 10회 미만 실패
        await prisma.member.update({
          where: { id: user.id },
          data: updateData,
        });

        return NextResponse.json(
          {
            success: false,
            message: `비밀번호가 올바르지 않습니다. (${failedAttempts}/10회 실패)`,
          },
          { status: 401 }
        );
      }
    }

    // 로그인 성공 시 온라인 상태 업데이트 및 실패 횟수 초기화
    await prisma.member.update({
      where: { id: user.id },
      data: {
        is_online: true,
        last_seen: now,
        failed_login_attempts: 0, // 성공 시 실패 횟수 초기화
        last_failed_login: null,
      },
    });

    const token = jwt.sign(
      {
        username: user.username,
        id: user.id,
        profile: user.profile,
        userNick: user.user_nickname,
        userEmail: user.email,
        userAuthority: user.authority,
        userNickUpdatedAt: user.nickname_updated_at,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;

    const response = NextResponse.json({
      success: true,
      username: user.username,
      userId: user.id,
      userNick: user.user_nickname,
      userProfile: user.profile,
      userEmail: user.email,
      userAuthority: user.authority,
      userNickUpdatedAt: user.nickname_updated_at,
      exp,
    });

    const isProduction = process.env.NODE_ENV === "production";

    const cookie = [
      `authToken=${token}`,
      `Path=/`,
      `HttpOnly`,
      `Max-Age=3600`,
      `SameSite=Lax`,
      ...(isProduction ? ["Secure"] : []),
    ].join("; ");

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
