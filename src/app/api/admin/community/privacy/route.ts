import { NextRequest, NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const PRIVACY_FILE_PATH = path.join(process.cwd(), "data", "privacy-policy.txt");

export async function GET() {
  try {
    await mkdir(path.dirname(PRIVACY_FILE_PATH), { recursive: true });

    let content = "";
    try {
      content = await readFile(PRIVACY_FILE_PATH, "utf-8");
    } catch {
      // 파일이 없으면 빈 문자열 반환
      content = "";
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("개인정보처리방침 불러오기 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "내용이 비어있습니다" }, { status: 400 });
    }

    // 디렉토리 생성
    await mkdir(path.dirname(PRIVACY_FILE_PATH), { recursive: true });

    // 파일에 저장
    await writeFile(PRIVACY_FILE_PATH, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "개인정보처리방침이 저장되었습니다",
    });
  } catch (error) {
    console.error("개인정보처리방침 저장 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
