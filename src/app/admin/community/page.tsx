"use client";

import { useState } from "react";

import CommManage from "./components/commManage";
import CommUsePolicy from "./components/commUsePolicy";
import CommUseTerm from "./components/commUseTerm";

export default function Community() {
  const [section, setSection] = useState<string>("commManage");

  return (
    <div className='admin_page'>
      <menu className='left_menu'>
        <button
          onClick={() => {
            setSection("commManage");
          }}>
          커뮤니티 관리
        </button>
        <button
          onClick={() => {
            setSection("commUsePolicy");
          }}>
          개인정보처리방침
        </button>
        <button
          onClick={() => {
            setSection("commUseTerm");
          }}>
          이용약관
        </button>
      </menu>

      {section === "commManage" ? (
        <CommManage />
      ) : section === "commUsePolicy" ? (
        <CommUsePolicy />
      ) : section === "commUseTerm" ? (
        <CommUseTerm />
      ) : null}
    </div>
  );
}
