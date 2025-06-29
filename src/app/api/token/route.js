import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const username = decoded.username;
    const userId = decoded.id;
    const userNick = decoded.user_nickname;
    const userProfile = decoded.profile;
    const userEmail = decoded.email;

    return NextResponse.json({
      authenticated: true,
      username: username,
      userId: userId,
      userNick: userNick,
      userProfile: userProfile,
      userEmail: userEmail,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
