import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "비밀번호 찾기 요청",
      text: `안녕하세요, ${username}님!\n\n요청하신 임시 비밀번호는: ${newPassword} 입니다.\n\n로그인 후 반드시 비밀번호를 변경하세요!`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "임시 비밀번호가 이메일로 전송되었습니다." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
