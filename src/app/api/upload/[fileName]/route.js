// /api/upload-url/route.ts
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/db/s3";

const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfront = process.env.AWS_CLOUD_FRONT_URL;

export async function GET() {
  const fileName = decodeURIComponent(params.fileName);
  const extension = fileName.split(".").pop()?.toLowerCase() || "bin";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const isVideo = ["mp4", "webm", "ogg"].includes(extension);

  let folder = "posts/others";
  let contentType = "application/octet-stream";

  if (isImage) {
    folder = "posts/images";
    contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;
  } else if (isVideo) {
    folder = "posts/videos";
    contentType = `video/${extension}`;
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
