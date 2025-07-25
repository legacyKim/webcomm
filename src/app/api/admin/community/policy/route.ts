import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const policy = await prisma.policy.findFirst({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      content: policy?.content || "",
    });
  } catch (error) {
    console.error("개인정보처리방침 조회 실패:", error);
    return NextResponse.json({ error: "개인정보처리방침을 불러올 수 없습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "유효하지 않은 내용입니다." }, { status: 400 });
    }

    // 기존 개인정보처리방침이 있는지 확인
    const existingPolicy = await prisma.policy.findFirst({
      orderBy: { created_at: "desc" },
    });

    let policy;
    if (existingPolicy) {
      // 기존 개인정보처리방침 업데이트
      policy = await prisma.policy.update({
        where: { id: existingPolicy.id },
        data: {
          content,
          updated_at: new Date(),
        },
      });
    } else {
      // 새 개인정보처리방침 생성
      policy = await prisma.policy.create({
        data: {
          content,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: "개인정보처리방침이 저장되었습니다.",
      policy,
    });
  } catch (error) {
    console.error("개인정보처리방침 저장 실패:", error);
    return NextResponse.json({ error: "개인정보처리방침 저장에 실패했습니다." }, { status: 500 });
  }
}
