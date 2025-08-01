import { redirect } from "next/navigation";

// 기본 profile 페이지는 현재 로그인한 사용자의 프로필로 리다이렉트
export default function ProfilePage() {
  // TODO: 실제 로그인한 사용자 정보를 가져와서 리다이렉트
  // 현재는 예시로 'current-user'로 리다이렉트
  redirect("/profile/current-user");
}
