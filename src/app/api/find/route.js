import { NextResponse } from "next/server";

import { Resend } from "resend";

import bcrypt from "bcrypt";
import pool from "@/db/db";

export async function POST(req) {
  const client = await pool.connect();
  const { userEmail } = await req.json();

  try {
    const query = "SELECT id, username FROM members WHERE email = $1";
    const result = await client.query(query, [userEmail]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "이메일이 존재하지 않습니다." }, { status: 404 });
    }

    const { id, username } = result.rows[0];

    const generateRandomPassword = () => {
      const digits = "0123456789";
      return Array.from({ length: 6 }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
    };

    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = "UPDATE members SET password = $1 WHERE id = $2";
    await client.query(updateQuery, [hashedPassword, id]);

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "noreply@tokti.net",
      to: userEmail,
      subject: "비밀번호 찾기 요청",
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
        <div style="background-color: #0070f3; padding: 16px; color: white; font-weight: bold; font-size: 18px;">
          Tokti 비밀번호 찾기 안내
        </div>
        <div style="padding: 20px; font-size: 14px; line-height: 1.6; color: #333;">
          <p>안녕하세요, <strong>Tokti</strong> 입니다.</p>
          <p>새로운 비밀번호는 다음과 같습니다.</p>
          <p style="font-size: 24px; font-weight: bold; color: #0070f3; margin: 16px 0;">${newPassword}</p>
          <p>위 비밀번호로 로그인하신 후, 반드시 비밀번호를 변경하세요!</p>
          <p style="margin-top: 24px;">감사합니다.</p>
        </div>
      </div>
      `,
    });

    return NextResponse.json({ success: true, message: "임시 비밀번호가 이메일로 전송되었습니다." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
