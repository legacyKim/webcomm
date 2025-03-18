"use client";

import axios from "axios";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../AuthContext'

export default function Header({ authToken, username, userId, userNick, userProfile }:
    { authToken: boolean; username: string; userId: number; userNick: string; userProfile: string; }) {
        
    const router = useRouter();
    const {
        loginStatus, setLoginStatus,
        isUsername, setIsUsername,
        isUserId, setIsUserId,
        isUserNick, setIsUserNick,
        isUserProfile, setIsUserProfile,
    } = useAuth();

    useEffect(() => {
        setIsUsername(username);
        setIsUserId(userId);
        setIsUserNick(userNick);
        setIsUserProfile(userProfile);
    }, []);

    const logout = async () => {
        const response = await axios.post('/api/logout');
        if (response.data.success) {

            alert("로그아웃 되었습니다.");

            setIsUsername('');
            setLoginStatus(false);

            router.push('/');
        }
    }

    const logoutPop = () => {
        const isConfirmed = confirm("로그아웃 하시겠습니까?");
        if (isConfirmed) {
            logout();
        }
    }

    return (
        <header className="header">
            <div className="header_top page">
                <Link href="/" className="logo">로고</Link>

                <div className="header_info">

                    {loginStatus === null ? (
                        <>
                            <p>로딩 중...</p>
                        </>
                    ) : loginStatus ? (
                        <>
                            <div className="userInfo">
                                <img src={`${userProfile ? userProfile : isUserProfile}`} alt={`${userNick ? userNick : isUserNick}의 프로필 이미지`}></img>
                                <span>{userNick ? userNick : isUserNick} 님 환영합니다.</span>
                            </div>
                            <span>알림</span>
                            <Link href="/my">마이페이지</Link>
                            <button onClick={() => { logoutPop() }} className="">로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="">로그인</Link>
                            <Link href="/agree" className="">회원가입</Link>
                        </>
                    )}

                </div>
            </div>
        </header>
    )
}