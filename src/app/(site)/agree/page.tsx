import { prisma } from "@/lib/prisma";
import AgreeClient from "./AgreeClient";

// 서버에서 데이터 가져오기
async function getPoliciesData() {
  try {
    const [policy, signupTerms] = await Promise.all([
      prisma.policy.findFirst({
        orderBy: { created_at: "desc" },
      }),
      prisma.signupTerms.findFirst({
        orderBy: { created_at: "desc" },
      }),
    ]);

    return {
      privacyContent: policy?.content,
      signupTermsContent: signupTerms?.content,
    };
  } catch (error) {
    console.error("약관 데이터 로딩 오류:", error);
    return {
      privacyContent: "",
      signupTermsContent: "",
    };
  }
}

export default async function Member() {
  const { privacyContent, signupTermsContent } = await getPoliciesData();

  return (
    <AgreeClient
      privacyContent={privacyContent}
      signupTermsContent={signupTermsContent}
    />
  );
}
