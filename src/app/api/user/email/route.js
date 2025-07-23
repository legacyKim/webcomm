import { NextResponse } from "next/server";

import { Resend } from "resend";

export async function POST(req) {
  const { userEmail } = await req.json();
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "noreply@tokti.net",
      to: userEmail,
      subject: "인증번호 이메일입니다.",
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
        <div style="background-color: #0070f3; padding: 16px; color: white; font-weight: bold; font-size: 18px;">
          Tokti 이메일 인증번호 발급 안내
        </div>
        <div style="padding: 20px; font-size: 14px; line-height: 1.6; color: #333;">
          <p>안녕하세요, <strong>Tokti</strong> 입니다.</p>
          <p>이메일 인증 번호는 다음과 같습니다.</p>
          <p style="font-size: 24px; font-weight: bold; color: #0070f3; margin: 16px 0;">${verifyCode}</p>
          <p>위 번호를 <strong>인증번호</strong> 칸에 입력해 주세요.</p>
          <p style="margin-top: 24px;">감사합니다.</p>
        </div>
      </div>`,
    });

    return NextResponse.json({ success: true, verifyCode }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
