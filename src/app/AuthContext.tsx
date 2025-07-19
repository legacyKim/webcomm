"use client";

import React, { createContext, useContext, useState } from "react";
import { AuthContextType } from "@/type/type";
import { Posts } from "@/type/type";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  username,
  userId,
  userNick,
  userProfile,
  userEmail,
  userAuthority,
  tokenExp,
  userNickUpdatedAt,
  loginStatusCheck,
}: {
  children: React.ReactNode;
  username: string;
  userId: number | null;
  userNick: string;
  userProfile: string;
  userEmail: string;
  userAuthority: number | null;
  tokenExp: number | null;
  userNickUpdatedAt: Date | null;
  loginStatusCheck: boolean | null;
}) {
  const [isUsername, setIsUsername] = useState<string | null>(username);
  const [isUserId, setIsUserId] = useState<number | null>(userId);
  const [isUserNick, setIsUserNick] = useState<string | null>(userNick);
  const [isUserProfile, setIsUserProfile] = useState<string | null>(userProfile);

  const [isUserEmail, setIsUserEmail] = useState<string | null>(userEmail);
  const [isUserAuthority, setIsUserAuthority] = useState<number | null>(userAuthority);
  const [isUserNickUpdatedAt, setIsUserNickUpdatedAt] = useState<Date | null>(userNickUpdatedAt);

  const [loginStatus, setLoginStatus] = useState<boolean | null>(loginStatusCheck);
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(tokenExp);

  const [boardType, setBoardType] = useState<string | null>("board");
  const [messageToUser, setMessageToUser] = useState<number | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const [initData, setInitData] = useState<{ posts: Posts[] } | null>(null);

  // useEffect(() => {
  //   setIsUsername(username);
  //   setIsUserId(userId);
  //   setIsUserNick(userNick);
  //   setIsUserProfile(userProfile);
  //   setIsUserEmail(userEmail);
  //   setIsUserAuthority(userAuthority);
  //   setTokenExpiration(tokenExp);
  //   setIsUserNickUpdatedAt(userNickUpdatedAt);
  // }, [username, userId, userNick, userProfile, userEmail, userAuthority, tokenExpiration]);

  return (
    <AuthContext.Provider
      value={{
        isUsername,
        setIsUsername,
        isUserId,
        setIsUserId,
        isUserNick,
        setIsUserNick,
        isUserProfile,
        setIsUserProfile,
        isUserEmail,
        setIsUserEmail,
        loginStatus,
        setLoginStatus,
        boardType,
        setBoardType,
        messageToUser,
        setMessageToUser,
        isUserAuthority,
        setIsUserAuthority,
        tokenExpiration,
        setTokenExpiration,
        isUserNickUpdatedAt,
        setIsUserNickUpdatedAt,
        redirectPath,
        setRedirectPath,
        initData,
        setInitData,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context as AuthContextType;
}
