"use client";
import { usePathname } from "next/navigation";

export default function Right_ad() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/user" || pathname === "/find" || pathname === "/agree") return null;

  return (
    <div className='right_ad'>
      <div
        style={{
          position: "sticky",
          top: "16px",
          height: "400px",
          width: "100%",
          backgroundColor: "#ddd",
          opacity: 0,
        }}></div>
    </div>
  );
}
