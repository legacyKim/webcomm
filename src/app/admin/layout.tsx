import "../style/base.css";
import "./admin.scss";

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='admin-container'>
      <header className='admin_header'>
        <Link className='admin_logo' href='/admin'>
          어드민
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
  );
}
