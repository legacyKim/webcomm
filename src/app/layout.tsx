import type { Metadata } from "next";

import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthContext";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import Header from "./components/header";
import Footer from "./components/footer";
import Menu from "./components/menu";
import Right_ad from "./components/right_ad";

export const metadata: Metadata = {
  title: "New web",
  description: "community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const isAdmin = "admin";

  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value ?? '';

  let authToken = false;
  let username = "";
  let userId = 0;
  let userNick = "";
  let userProfile = "";
  let userEmail = "";

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        username: string, id: number; userNick: string; profile: string; userEmail: string;
      };

      authToken = true;
      username = decoded.username;
      userId = decoded.id;
      userNick = decoded.userNick;
      userProfile = decoded.profile;
      userEmail = decoded.userEmail;

    } catch (error) {
      console.error("토큰 검증 실패:", error);
    }
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider username={username} userId={userId} userNick={userNick} userProfile={userProfile} userEmail={userEmail}>
          <QueryProvider>
            {!isAdmin ? (
              <>{children}</>
            ) : (
              <>
                <Header authToken={authToken} username={username} userId={userId} userNick={userNick} userProfile={userProfile} />
                <div className="page main">
                  {/* {!isMember && ( */}
                  <Menu />
                  {/* )} */}
                  {children}
                  <Right_ad />
                </div>
                <Footer />
              </>
            )}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
