"use client";

import { usePathname } from "next/navigation";

import Header from "./components/header";
import Footer from "./components/footer";
import Menu from "./components/menu";
import Right_ad from "./components/right_ad";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className='page main'>
        <Menu />
        {children}
        <Right_ad />
      </div>
      <Footer />
    </>
  );
}
