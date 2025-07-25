import { NextRequest, NextResponse } from "next/server";
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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "comment" | "post"

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 크기 검증
    const maxSize = type === "comment" ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 댓글: 2MB, 게시글: 5MB
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json({ error: `최대 ${maxSizeMB}MB 이하의 파일만 업로드 가능합니다.` }, { status: 400 });
    }

    // 파일 확장자 검증
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "지원되지 않는 파일 형식입니다." }, { status: 400 });
    }

    // 파일명 생성 (timestamp + random string)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${type}/${timestamp}_${randomString}.${extension}`;

    // 파일 데이터를 ArrayBuffer로 변환
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
    const fileUrl = `${process.env.AWS_CLOUD_FRONT_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      message: "파일이 성공적으로 업로드되었습니다.",
    });
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 });
  }
}
