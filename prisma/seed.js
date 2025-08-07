import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(
    `${process.env.ADMIN_PASSWORD_FIRST}`,
    10
  );

  // 관리자 계정 생성
  const adminUser = await prisma.member.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      all_posts: 0,
      all_views: 0,
      authority: 0, // 관리자 권한
      password: hashedPassword,
      user_nickname: "관리자",
      profile: null,
    },
  });

  // 게시판 생성 (베스트, 자유게시판, 건의사항)
  const bestBoard = await prisma.board.upsert({
    where: { id: 1 },
    update: {},
    create: {
      board_name: "베스트게시판",
      url_slug: "best",
      seq: 1,
    },
  });

  const freeBoard = await prisma.board.upsert({
    where: { id: 2 },
    update: {},
    create: {
      board_name: "자유게시판",
      url_slug: "free",
      seq: 2,
    },
  });

  const suggestionBoard = await prisma.board.upsert({
    where: { id: 3 },
    update: {},
    create: {
      board_name: "건의사항",
      url_slug: "suggestion",
      seq: 3,
    },
  });

  // TODO: 메뉴 커스텀 설정은 나중에 추가
  /*
  // 관리자를 위한 기본 메뉴 설정 (베스트게시판과 자유게시판을 메인 메뉴로)
  // @ts-ignore
  await prisma.menuCustom.upsert({
    where: {
      unique_user_board: {
        user_id: adminUser.id,
        board_id: bestBoard.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      board_id: bestBoard.id,
      priority: 1,
      is_visible: true,
    },
  });

  // @ts-ignore
  await prisma.menuCustom.upsert({
    where: {
      unique_user_board: {
        user_id: adminUser.id,
        board_id: freeBoard.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      board_id: freeBoard.id,
      priority: 2,
      is_visible: true,
    },
  });
  */

  console.log("관리자의 기본 메뉴 설정이 완료되었습니다.");
}

main()
  .then(() => console.log("Seed completed!"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
