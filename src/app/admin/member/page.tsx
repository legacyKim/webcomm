"use client";

import { useState } from "react";

import MemberManage from "./components/memberManage"

export default function Member() {

    const [section, setSection] = useState<string>('memberManage');

    return (
        <div className="admin_page">
            <menu className="left_menu">
                <button onClick={() => { setSection('memberManage') }}>회원관리</button>
            </menu>

            {section === 'memberManage' ? (
                <MemberManage />
            ) : null}

        </div>
    )
}