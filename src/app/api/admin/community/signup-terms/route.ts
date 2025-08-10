import { NextRequest, NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const signupTerms = await prisma.signupTerms.findFirst({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ content: signupTerms?.content || "" });
  } catch (error) {
    console.error("회원가입약관 불러오기 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();

    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "내용이 비어있습니다" },
        { status: 400 }
      );
    }

    // Prisma ORM 방식으로 저장
    await prisma.signupTerms.create({
      data: { content },
    });

    return NextResponse.json({
      success: true,
      message: "회원가입약관이 저장되었습니다",
    });
  } catch (error) {
    console.error("회원가입약관 저장 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
