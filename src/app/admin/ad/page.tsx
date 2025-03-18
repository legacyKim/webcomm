"use client";

import { useState } from "react";

import AdManage from "./components/adManage"

export default function Ad() {

    const [section, setSection] = useState<string>('adManage');

    return (
        <div className="admin_page">

            <menu className="left_menu">
                <button onClick={() => { setSection('adManage') }}>광고 관리</button>
            </menu>

            {section === 'adManage' ? (
                <AdManage />
            ) : null}

        </div>
    )
}