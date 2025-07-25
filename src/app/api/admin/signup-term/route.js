import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const signupTerm = await prisma.signupTerm.findFirst({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: signupTerm,
    });
  } catch (error) {
    console.error("회원가입약관 조회 실패:", error);
    return NextResponse.json({ success: false, error: "회원가입약관 조회에 실패했습니다." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ success: false, error: "내용을 입력해주세요." }, { status: 400 });
    }

    // 기존 회원가입약관이 있는지 확인
    const existingSignupTerm = await prisma.signupTerm.findFirst();

    let signupTerm;
    if (existingSignupTerm) {
      // 기존 회원가입약관 업데이트
      signupTerm = await prisma.signupTerm.update({
        where: { id: existingSignupTerm.id },
        data: {
          content: content.trim(),
          updated_at: new Date(),
        },
      });
    } else {
      // 새 회원가입약관 생성
      signupTerm = await prisma.signupTerm.create({
        data: {
          content: content.trim(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: signupTerm,
    });
  } catch (error) {
    console.error("회원가입약관 저장 실패:", error);
    return NextResponse.json({ success: false, error: "회원가입약관 저장에 실패했습니다." }, { status: 500 });
  }
}
