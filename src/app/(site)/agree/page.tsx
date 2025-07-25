import { prisma } from "@/lib/prisma";
import AgreeClient from "./AgreeClient";

// 서버에서 데이터 가져오기
async function getPoliciesData() {
  try {
    const [terms, policy] = await Promise.all([
      prisma.terms.findFirst({
        orderBy: { created_at: "desc" },
      }),
      prisma.policy.findFirst({
        orderBy: { created_at: "desc" },
      }),
    ]);

    return {
      termsContent: terms?.content,
      privacyContent: policy?.content,
    };
  } catch (error) {
    console.error("약관 데이터 로딩 오류:", error);
  }
}

export default async function Member() {
  const { termsContent, privacyContent } = (await getPoliciesData()) || {};

  return <AgreeClient termsContent={termsContent} privacyContent={privacyContent} />;
}
