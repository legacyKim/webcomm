import { NextResponse } from "next/server";
import pool from "../../../db/db";

export async function GET() {
  const client = await pool.connect();
  client.query("LISTEN comment_events");

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
