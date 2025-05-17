// /api/upload-url/route.ts
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../../db/s3";

const bucketName = process.env.AWS_BUCKET_NAME;
const clounfront = process.env.AWS_CLOUD_FRONT_URL

export async function GET(req, { params }) {
    const filename = params.filenName ?? `img-${Date.now()}.png`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `posts/${filename}`,
        ContentType: "image/png",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    const fileUrl = `${clounfront}/posts/${filename}`;

    return NextResponse.json({
        url,
        fileUrl
    });
}
