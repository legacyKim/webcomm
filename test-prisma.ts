import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    // Prisma 클라이언트에서 사용 가능한 모델들 확인
    console.log("Available models:");
    console.log(Object.keys(prisma));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
