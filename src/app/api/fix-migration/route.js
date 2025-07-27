// 일회성 마이그레이션 수정 API
// 사용 후 반드시 삭제하세요!

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fix = searchParams.get("fix");

  // 보안을 위한 간단한 체크
  if (fix !== "migration2025") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const prisma = new PrismaClient();

    // 실패한 마이그레이션을 성공으로 표시
    await prisma.$executeRaw`
      UPDATE _prisma_migrations 
      SET finished_at = NOW(), 
          logs = 'Manual fix - columns and constraints already exist' 
      WHERE migration_name = '20250727075449_re' AND finished_at IS NULL;
    `;

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: "Migration 20250727075449_re marked as completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Migration fix error:", error);
    return NextResponse.json(
      {
        error: error.message,
        message: "Failed to fix migration",
      },
      { status: 500 },
    );
  }
}
