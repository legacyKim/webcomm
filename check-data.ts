import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log("=== 게시판 목록 ===");
    const boards = await prisma.board.findMany({
      orderBy: { id: "asc" },
    });
    console.log(boards);

    console.log("\n=== 관리자 계정 ===");
    const admin = await prisma.member.findFirst({
      where: { username: "admin" },
      select: {
        id: true,
        username: true,
        user_nickname: true,
        email: true,
        authority: true,
        createdAt: true,
      },
    });
    console.log(admin);
  } catch (error) {
    console.error("데이터 확인 중 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
