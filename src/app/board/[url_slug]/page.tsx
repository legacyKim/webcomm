"use client";

import "../../style/base.css";
import "../../style/font.css";
import "../../style/fontello/css/fontello.css";
import "../../style/fontello/css/animation.css";

// import Image from "next/image";
import "../../style/style.common.scss"

import Link from 'next/link';

import { useParams } from "next/navigation";
import Search from "../../components/search";

import { useAuth } from '../../AuthContext';

import Boardlist from "../boardlist";

interface Board {
    board_name: string;
    posts: Array<{ title: string; content: string }>;
}

export default function Board() {

    const params = useParams();
    const url_slug = params?.url_slug;

    const { isUsername } = useAuth();

    return (
        <sub className="sub">

            <Search />

            <div className="board_single">

                {/* board best */}
                <div className="board">
                    <div className="board_top">
                        <select>
                            <option></option>
                        </select>

                        {isUsername && (
                            <div className="btn_wrap btn_wrap_mb0">
                                <Link href={`/write`}>글쓰기</Link>
                            </div>
                        )}

                    </div>

                    <Boardlist url_slug={url_slug as string} />

                </div>
            </div>
        </sub>
    )
}