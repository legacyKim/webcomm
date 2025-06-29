import { NextResponse } from "next/server";
import pool from "@/db/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const client = await pool.connect(); // 연결 유지

      await client.query("LISTEN new_notification");

      const handleNotification = async (msg) => {
        if (msg.channel === "new_notification") {
          const result = await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1`);
          const latest = result.rows[0];

          if (latest?.receiver_id?.toString() === userId) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(latest)}\n\n`));
          }
        }
      };

      client.on("notification", handleNotification);

      stream.cancel = () => {
        client.off("notification", handleNotification);
        client.release(); // 반드시 해제
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
