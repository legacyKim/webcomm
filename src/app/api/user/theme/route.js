import { NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

// GET - 사용자 테마 설정 조회
export async function GET(request) {
  try {
    const tokenResult = await serverTokenCheck(request);
    if (!tokenResult.success) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    // 세션에서 다크모드 설정 조회
    const darkMode = request.cookies.get("darkMode")?.value === "true" || false;

    return NextResponse.json({
      success: true,
      darkMode: darkMode,
    });
  } catch (error) {
    console.error("테마 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "테마 설정을 조회할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}

// POST - 사용자 테마 설정 저장
export async function POST(request) {
  try {
    const tokenResult = await serverTokenCheck(request);
    if (!tokenResult.success) {
      return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
    }

    const { darkMode } = await request.json();

    // 쿠키에 다크모드 설정 저장 (세션 쿠키)
    const response = NextResponse.json({
      success: true,
      message: "테마 설정이 저장되었습니다.",
    });

    response.cookies.set("darkMode", darkMode.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (error) {
    console.error("테마 저장 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "테마 설정을 저장할 수 없습니다.",
      },
      { status: 500 },
    );
  }
}
