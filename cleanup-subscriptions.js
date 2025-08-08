const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupDuplicateSubscriptions() {
  try {
    console.log("중복 구독 정리를 시작합니다...");

    // 모든 구독을 사용자별로 그룹화하여 조회
    const subscriptions = await prisma.pushSubscription.findMany({
      orderBy: [
        { user_id: "asc" },
        { created_at: "desc" }, // 최신 것을 먼저
      ],
    });

    console.log(`총 ${subscriptions.length}개의 구독이 있습니다.`);

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
        console.log(`사용자 ${userId}: ${userSubs.length}개의 구독 발견`);

        // 최신 구독 1개를 제외하고 나머지 삭제
        const toDelete = userSubs.slice(1);

        for (const sub of toDelete) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
          console.log(`  - 구독 삭제: ${sub.endpoint.substring(0, 50)}...`);
          totalDeleted++;
        }
      }
    }

    console.log(`정리 완료: ${totalDeleted}개의 중복 구독을 삭제했습니다.`);

    // 최종 결과 확인
    const finalCount = await prisma.pushSubscription.count();
    console.log(`남은 구독 수: ${finalCount}개`);
  } catch (error) {
    console.error("정리 중 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateSubscriptions();
