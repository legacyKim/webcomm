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

  const MAX_SIZE = 2 * 1024 * 1024;

  if (fileSize > MAX_SIZE) {
    return NextResponse.json({ error: `파일 용량 초과 (최대 ${MAX_SIZE / 1024 / 1024}MB)` }, { status: 400 });
  }

  let contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
  const key = `comment/${fileName}`;

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
