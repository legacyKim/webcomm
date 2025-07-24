module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // React Hook 의존성 경고를 에러가 아닌 경고로 설정
    "react-hooks/exhaustive-deps": "warn",

    // 사용하지 않는 변수 에러를 경고로 변경
    "@typescript-eslint/no-unused-vars": "warn",

    // any 타입 사용을 경고로 설정
    "@typescript-eslint/no-explicit-any": "warn",

    // img 태그 사용 경고를 끔 (기존 코드와의 호환성)
    "@next/next/no-img-element": "warn",
  },
};
