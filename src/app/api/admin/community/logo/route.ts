import { NextRequest, NextResponse } from "next/server";
import { serverTokenCheck } from "@/lib/serverTokenCheck";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const userData = await serverTokenCheck();
    if (!userData || userData.userAuthority !== 0) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 선택되지 않았습니다" }, { status: 400 });
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다" }, { status: 400 });
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다" }, { status: 400 });
    }

    // 파일 확장자 가져오기
    const extension = file.name.split(".").pop() || "png";
    const fileName = `logo/logo.${extension}`;

    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();

    // S3 업로드 파라미터
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
    };

    // S3에 업로드
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // CloudFront URL 생성
    const logoUrl = `${process.env.AWS_CLOUD_FRONT_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      logoUrl,
      message: "로고가 성공적으로 업로드되었습니다",
    });
  } catch (error) {
    console.error("로고 업로드 실패:", error);
    return NextResponse.json({ error: "로고 업로드에 실패했습니다" }, { status: 500 });
  }
}
