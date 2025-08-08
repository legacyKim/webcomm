const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupDuplicateSubscriptions() {
  try {
    // 모든 구독을 사용자별로 그룹화하여 조회
    const subscriptions = await prisma.pushSubscription.findMany({
      orderBy: [
        { user_id: "asc" },
        { created_at: "desc" }, // 최신 것을 먼저
      ],
    });

    // 사용자별로 그룹화
    const userSubscriptions = {};
    subscriptions.forEach((sub) => {
      if (!userSubscriptions[sub.user_id]) {
        userSubscriptions[sub.user_id] = [];
      }
      userSubscriptions[sub.user_id].push(sub);
    });

    let totalDeleted = 0;

    // 각 사용자별로 최신 구독 1개만 남기고 나머지 삭제
    for (const [userId, userSubs] of Object.entries(userSubscriptions)) {
      if (userSubs.length > 1) {
        // 최신 구독 1개를 제외하고 나머지 삭제
        const toDelete = userSubs.slice(1);

        for (const sub of toDelete) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
          totalDeleted++;
        }
      }
    }

    // 최종 결과 확인
    const finalCount = await prisma.pushSubscription.count();
  } catch (error) {
    console.error("정리 중 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateSubscriptions();
