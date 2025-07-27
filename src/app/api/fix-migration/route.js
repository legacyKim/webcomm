// 일회성 마이그레이션 수정 API
// 사용 후 반드시 삭제하세요!

export default async function handler(req, res) {
  // 보안을 위한 간단한 체크
  if (req.query.fix !== "migration2025") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // 실패한 마이그레이션을 성공으로 표시
    await prisma.$executeRaw`
      UPDATE _prisma_migrations 
      SET finished_at = NOW(), 
          logs = 'Manual fix - columns and constraints already exist' 
      WHERE migration_name = '20250727075449_re' AND finished_at IS NULL;
    `;

    await prisma.$disconnect();

    res.json({
      success: true,
      message: "Migration 20250727075449_re marked as completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Migration fix error:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to fix migration",
    });
  }
}
