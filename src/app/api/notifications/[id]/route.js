import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function PATCH(req, { params }) {
  if (!params.id) {
    return NextResponse.json({ success: false, error: "id 값이 없습니다." }, { status: 400 });
  }
  const id = params.id;

  try {
    await pool.query(`UPDATE notifications SET is_read = TRUE WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
