import "@/style/base.css";
import "@/admin/admin.scss";
import Link from "next/link";

import QueryProvider from "@/QueryProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='kor'>
      <body>
        <QueryProvider>
          <div className='admin-container'>
            <header className='admin_header'>
              <Link className='admin_logo' href='/'>
                홈으로
              </Link>
              <menu className='admin_menu'>
                <Link href='/admin/board'>게시판 관리</Link>
                <Link href='/admin/member'>회원 관리</Link>
                <Link href='/admin/ad'>광고 관리</Link>
                <Link href='/admin/community'>커뮤니티 관리</Link>
              </menu>
            </header>
            <div className='admin'>{children}</div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
