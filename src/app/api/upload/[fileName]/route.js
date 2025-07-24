import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/db/s3";

const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfront = process.env.AWS_CLOUD_FRONT_URL;

export async function GET(request, context) {
  if (context.params.fileName === undefined) {
    return NextResponse.json({ error: "파일 이름이 필요합니다." }, { status: 400 });
  }
  const fileName = decodeURIComponent(context.params.fileName);
  const extension = fileName.split(".").pop()?.toLowerCase() || "bin";

  const searchParams = new URL(request.url).searchParams;
  const rawSize = searchParams.get("size");
  const fileSize = Number(rawSize);

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const isVideo = ["mp4", "webm", "ogg"].includes(extension);

  let folder = "posts/others";
  let contentType = "application/octet-stream";
  let maxSize = 10 * 1024 * 1024; // 일반 파일 10MB

  if (isImage) {
    folder = "posts/images";
    contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
    maxSize = 10 * 1024 * 1024; // 이미지 10MB
  } else if (isVideo) {
    folder = "posts/videos";
    contentType = `video/${extension}`;
    maxSize = 100 * 1024 * 1024; // 동영상 100MB
  }

  if (fileSize > maxSize) {
    return NextResponse.json({ error: `파일 용량 초과 (최대 ${maxSize / 1024 / 1024}MB)` }, { status: 400 });
  }

  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  const fileUrl = `${cloudfront}/${key}`;

  return NextResponse.json({
    url,
    fileUrl,
  });
}
