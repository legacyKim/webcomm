import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-revalidate-secret");
    const expectedSecret = process.env.REVALIDATE_SECRET || "local-dev-secret";

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tag, path } = body || {};

    if (!tag && !path) {
      return NextResponse.json(
        { ok: false, error: "missing tag or path" },
        { status: 400 }
      );
    }

    if (tag) {
      try {
        await revalidateTag(tag);
      } catch (err) {
        console.error("revalidateTag error", err);
        return NextResponse.json(
          { ok: false, error: String(err) },
          { status: 500 }
        );
      }
    }

    if (path) {
      try {
        await revalidatePath(path);
      } catch (err) {
        console.error("revalidatePath error", err);
        return NextResponse.json(
          { ok: false, error: String(err) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("revalidate endpoint error", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
