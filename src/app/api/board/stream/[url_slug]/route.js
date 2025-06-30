import { NextResponse } from "next/server";
import pool from "../../../../db/db";

export const runtime = "nodejs";

let clients = {};

export async function GET(req, context) {
  const { url_slug } = await context.params;

  if (!url_slug) {
    return new NextResponse("Missing slug parameter", { status: 400 });
  }

  const client = await pool.connect();
  client.query("LISTEN post_trigger");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      if (!clients[url_slug]) clients[url_slug] = [];
      clients[url_slug].push(controller);

      client.on("notification", (msg) => {
        const data = JSON.parse(msg.payload);
        if (data.url_slug === url_slug) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      });
    },
    cancel() {
      clients[url_slug] = clients[url_slug].filter((c) => c !== this);
      if (clients[url_slug].length === 0) {
        // 해당 url_slug에 더 이상 클라이언트가 없으면 연결 종료
        client.query("UNLISTEN post_trigger");
      }
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
