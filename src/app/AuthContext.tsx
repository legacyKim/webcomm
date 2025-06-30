"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./type/type";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  username,
  userId,
  userNick,
  userProfile,
  userEmail,
}: {
  children: React.ReactNode;
  username: string;
  userId: number;
  userNick: string;
  userProfile: string;
  userEmail: string;
}) {
  const [isUsername, setIsUsername] = useState<string | null>(username);
  const [isUserId, setIsUserId] = useState<number | null>(userId);
  const [isUserNick, setIsUserNick] = useState<string | null>(userNick);
  const [isUserProfile, setIsUserProfile] = useState<string | null>(userProfile);
  const [isUserEmail, setIsUserEmail] = useState<string | null>(userEmail);

  const [loginStatus, setLoginStatus] = useState<boolean | null>(false);

  const [boardType, setBoardType] = useState<string | null>("board");
  const [messageToUser, setMessageToUser] = useState<number | null>(null);

  useEffect(() => {
    setIsUsername(username);
    setIsUserId(userId);
    setIsUserNick(userNick);
    setIsUserProfile(userProfile);
    setIsUserEmail(userEmail);
  }, [username, userId, userNick, userProfile, userEmail]);

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
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context as {
    loginStatus: boolean | null;
    setLoginStatus: (loginStatus: boolean) => void;
    isUsername: string;
    setIsUsername: (username: string) => void;
    isUserId: number | null;
    setIsUserId: (userId: number) => void;
    isUserNick: string | null;
    setIsUserNick: (userNick: string) => void;
    isUserProfile: string | null;
    setIsUserProfile: (userProfile: string) => void;
    isUserEmail: string | null;
    setIsUserEmail: (userProfile: string) => void;
    boardType: string | null;
    setBoardType: (type: string | null) => void;
    messageToUser: number | null;
    setMessageToUser: (type: number | null) => void;
  };
}
