const webpush = require("web-push");

// VAPID 키 생성
const vapidKeys = webpush.generateVAPIDKeys();

console.log("VAPID Keys 생성 완료!");
console.log("");
console.log("환경변수 파일(.env.local)에 다음 내용을 추가하세요:");
console.log("");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("");
console.log("클라이언트용 환경변수:");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log("");
console.log("VAPID 공개 키 (클라이언트에서 사용):");
console.log(vapidKeys.publicKey);
console.log("");
console.log("VAPID 개인 키 (서버에서만 사용, 절대 노출 금지):");
console.log(vapidKeys.privateKey);
