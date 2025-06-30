import { NextResponse } from "next/server";
import pool from "@/db/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const client = await pool.connect();

  // 'post_events' 채널을 구독
  client.query("LISTEN post_events");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      client.on("notification", (msg) => {
        controller.enqueue(encoder.encode(`data: ${msg.payload}\n\n`));
      });
    },
    cancel() {
      client.removeAllListeners();
      client.release();
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
