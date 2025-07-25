import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst({
      orderBy: { created_at: "desc" },
    });

    // 기본 설정이 없으면 생성
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          logo_url: "/logo.png",
          site_name: "Tokti",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("사이트 설정 조회 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const { logo_url, site_name } = await req.json();

    let settings = await prisma.siteSettings.findFirst();

    if (settings) {
      // 기존 설정 업데이트
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          logo_url,
          site_name,
          updated_at: new Date(),
        },
      });
    } else {
      // 새 설정 생성
      settings = await prisma.siteSettings.create({
        data: {
          logo_url,
          site_name,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("사이트 설정 업데이트 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
