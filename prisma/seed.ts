import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = crypto.createHash("sha256").update("admin0620!").digest("hex");

  // 관리자 계정 생성
  await prisma.member.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "",
      all_posts: 0,
      all_views: 0,
      authority: 0,
      password: hashedPassword,
      user_nickname: "관리자",
      profile: null,
    },
  });

  // 게시판 두 개 생성
  await prisma.board.upsert({
    where: { id: 1 },
    update: {},
    create: {
      board_name: "자유게시판",
      url_slug: "free",
      seq: 1,
    },
  });

  await prisma.board.upsert({
    where: { url_slug: "humor" },
    update: {},
    create: {
      board_name: "유머게시판",
      url_slug: "humor",
      seq: 2,
    },
  });
}

main()
  .then(() => console.log("🌱 Seed completed!"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
