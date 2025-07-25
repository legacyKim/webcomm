"use client";

import { useState } from "react";
import SiteSettingsManage from "./components/SiteSettingsManage";
import CommUsePolicy from "./components/commUsePolicy";
import CommUseTerm from "./components/commUseTerm";

export default function AdminSitePage() {
  const [section, setSection] = useState<string>("general");

  return (
    <div className='admin_page'>
      <menu className='left_menu'>
        <button onClick={() => setSection("general")}>일반 설정</button>
        <button onClick={() => setSection("terms")}>이용약관</button>
        <button onClick={() => setSection("policy")}>개인정보처리방침</button>
      </menu>

      {section === "general" ? (
        <SiteSettingsManage />
      ) : section === "terms" ? (
        <CommUseTerm />
      ) : section === "policy" ? (
        <CommUsePolicy />
      ) : null}
    </div>
  );
}
