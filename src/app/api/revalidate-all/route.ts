import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-deploy-secret");
    const expectedSecret = process.env.DEPLOY_SECRET;

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // 주요 경로들 전체 무효화
    const pathsToRevalidate = [
      "/",
      "/board/[url_slug]",
      "/board/[url_slug]/[id]",
      // 필요한 다른 경로들...
    ];

    for (const path of pathsToRevalidate) {
      try {
        await revalidatePath(path, "layout"); // layout까지 무효화
      } catch (err) {
        console.error(`Failed to revalidate ${path}:`, err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Revalidated ${pathsToRevalidate.length} paths`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Deploy revalidate error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
