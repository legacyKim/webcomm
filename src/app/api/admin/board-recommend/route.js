import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

// 게시판 추천 생성 API
export async function POST(request) {
  try {
    // JWT 토큰 검증
    const tokenData = await serverTokenCheck(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { board_name, reason } = await request.json();

    // 필수 필드 검증
    if (!board_name || board_name.trim() === "") {
      return NextResponse.json(
        { error: "게시판 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    // 게시판 이름 길이 검증
    if (board_name.length > 8) {
      return NextResponse.json(
        { error: "게시판 이름이 너무 깁니다. (최대 8자)" },
        { status: 400 }
      );
    }

    // 게시판 추천 저장
    const boardRecommend = await prisma.boardRecommend.create({
      data: {
        user_id: tokenData.id,
        board_name: board_name.trim(),
        reason: reason ? reason.trim() : null,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            user_nickname: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "게시판 추천이 접수되었습니다.",
      data: boardRecommend,
    });
  } catch (error) {
    console.error("게시판 추천 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 게시판 추천 목록 조회 API (관리자용)
export async function GET(request) {
  try {
    // JWT 토큰 검증
    const tokenData = await serverTokenCheck(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (tokenData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where = {};

    if (status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          board_name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            user_nickname: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // 전체 개수 조회
    const totalCount = await prisma.boardRecommend.count({ where });

    // 게시판 추천 목록 조회
    const recommendations = await prisma.boardRecommend.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            user_nickname: true,
            profile: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          hasMore: page * limit < totalCount,
        },
      },
    });
  } catch (error) {
    console.error("게시판 추천 목록 조회 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 게시판 추천 상태 업데이트 API (관리자용)
export async function PATCH(request) {
  try {
    // JWT 토큰 검증
    const tokenData = await serverTokenCheck(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (tokenData.userAuthority !== 0) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { id, status, admin_response } = await request.json();

    // 필수 필드 검증
    if (!id || !status) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 상태 값 검증
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "올바르지 않은 상태값입니다." },
        { status: 400 }
      );
    }

    // 게시판 추천 업데이트
    const updatedRecommendation = await prisma.boardRecommend.update({
      where: { id: parseInt(id) },
      data: {
        status,
        admin_response: admin_response ? admin_response.trim() : null,
        updated_at: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            user_nickname: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "게시판 추천 상태가 업데이트되었습니다.",
      data: updatedRecommendation,
    });
  } catch (error) {
    console.error("게시판 추천 상태 업데이트 API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
