import { NextRequest, NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 선택되지 않았습니다" }, { status: 400 });
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다" }, { status: 400 });
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public 디렉토리에 저장
    const uploadDir = path.join(process.cwd(), "public");
    const fileName = `logo${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);

    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);
    } catch (writeError) {
      console.error("파일 저장 오류:", writeError);
      return NextResponse.json({ error: "파일 저장에 실패했습니다" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logoUrl: `/${fileName}`,
      message: "로고가 성공적으로 업로드되었습니다",
    });
  } catch (error) {
    console.error("로고 업로드 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
