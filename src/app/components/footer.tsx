"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className='footer'>
      <div className='page'>
        <ul className='footer_list'>
          <li>
            <Link href='/privacy'>개인정보처리방침</Link>
          </li>
          <li>
            <Link href='/terms'>이용약관</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
