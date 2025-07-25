import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUD_FRONT_URL;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    if (!file) {
      return NextResponse.json({ success: false, error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
    }

    // 파일 확장자 추출
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension)) {
      return NextResponse.json({ success: false, error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
    }

    // 파일 버퍼로 변환
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // S3에 업로드할 파일 키 생성
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = type === "logo" ? `site/logo/${fileName}` : `uploads/${fileName}`;

    // S3 업로드 명령 생성
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: file.type,
      CacheControl: "max-age=31536000", // 1년 캐시
      Metadata: {
        originalName: file.name,
        uploadType: type || "general",
      },
    });

    // S3에 업로드
    await s3Client.send(command);

    // CloudFront URL 생성
    const fileUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      fileSize: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    return NextResponse.json({ success: false, error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 });
  }
}
