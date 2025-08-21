// Vercel Deploy Hook 스크립트
// 배포 완료 후 캐시 무효화를 위한 스크립트

const deploySecret = process.env.VERCEL_DEPLOY_SECRET || process.env.X_DEPLOY_SECRET;
const domain = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_DOMAIN;

async function callRevalidateAll() {
  if (!deploySecret || !domain) {
    console.log('🔧 환경변수가 설정되지 않아 캐시 무효화를 건너뜁니다.');
    return;
  }

  try {
    const response = await fetch(`https://${domain}/api/revalidate-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-deploy-secret': deploySecret
      }
    });

    if (response.ok) {
      console.log('✅ 배포 후 캐시 무효화 완료');
    } else {
      console.log('❌ 캐시 무효화 실패:', response.status);
    }
  } catch (error) {
    console.log('❌ 캐시 무효화 오류:', error.message);
  }
}

// 배포 완료 후 실행
if (process.env.VERCEL_ENV === 'production') {
  callRevalidateAll();
}
