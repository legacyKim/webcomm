import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

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
      html: "<p>인증번호: <strong>" + verifyCode + "</strong></p>",
    });

    return NextResponse.json({ success: true, verifyCode }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
