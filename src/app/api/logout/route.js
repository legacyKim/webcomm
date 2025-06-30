import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "로그아웃 되었습니다." });

    response.headers.set("Set-Cookie", `authToken=; Path=/; HttpOnly; Max-Age=0; Secure="false"; SameSite=Strict`);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
