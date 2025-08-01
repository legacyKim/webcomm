import { NextResponse } from "next/server";
import pool from "@/db/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { serverTokenCheck } from "@/lib/serverTokenCheck";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 서버에서 blob URL을 S3 URL로 교체하는 함수
const replaceBlobsWithS3UrlsServer = async (html, imageFiles, videoFiles) => {
  let processedHtml = html;

  // 이미지 파일 처리
  for (const imageFile of imageFiles) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = imageFile.name.split(".").pop();
      const fileName = `post/${timestamp}_${randomString}.${extension}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(imageFile.data, "base64"),
        ContentType: imageFile.type,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const fileUrl = `${process.env.AWS_CLOUD_FRONT_URL}/${fileName}`;
      processedHtml = processedHtml.replace(imageFile.blobUrl, fileUrl);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw new Error("이미지 업로드 중 문제가 발생했습니다.");
    }
  }

  // 비디오 파일 처리
  for (const videoFile of videoFiles) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = videoFile.name.split(".").pop();
      const fileName = `video/${timestamp}_${randomString}.${extension}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(videoFile.data, "base64"),
        ContentType: videoFile.type,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const fileUrl = `${process.env.AWS_CLOUD_FRONT_URL}/${fileName}`;
      processedHtml = processedHtml.replace(videoFile.blobUrl, fileUrl);
    } catch (error) {
      console.error("비디오 업로드 실패:", error);
      throw new Error("비디오 업로드 중 문제가 발생했습니다.");
    }
  }

  return processedHtml;
};

export async function POST(req) {
  const client = await pool.connect();

  try {
    const user = await serverTokenCheck();
    if (!user) {
      return NextResponse.json({ success: false, message: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    // 권한 확인: 경고회원(authority: 2)과 정지회원(authority: 3)은 게시글 작성 불가
    if (user.userAuthority === 2) {
      return NextResponse.json({ success: false, message: "경고회원은 게시글을 작성할 수 없습니다." }, { status: 403 });
    }

    if (user.userAuthority === 3) {
      return NextResponse.json(
        { success: false, message: "정지된 회원은 게시글을 작성할 수 없습니다." },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const boardId = formData.get("board_id");
    const boardname = formData.get("boardname");
    const url_slug = formData.get("url_slug");
    const user_id = formData.get("user_id");
    const user_nickname = formData.get("user_nickname");
    const title = formData.get("title");
    const content = formData.get("content");

    // 파일 데이터 가져오기
    const imageFilesData = formData.get("imageFiles");
    const videoFilesData = formData.get("videoFiles");

    const imageFiles = imageFilesData ? JSON.parse(imageFilesData) : [];
    const videoFiles = videoFilesData ? JSON.parse(videoFilesData) : [];

    // 주의회원인 경우 제한 기간 확인 (DB에서 최신 정보 조회)
    if (user.userAuthority === 1) {
      const memberResult = await client.query("SELECT restriction_until FROM members WHERE id = $1", [user_id]);

      if (memberResult.rows.length > 0) {
        const restrictionUntil = memberResult.rows[0].restriction_until;
        if (restrictionUntil && new Date(restrictionUntil) > new Date()) {
          return NextResponse.json(
            {
              success: false,
              message: `게시글 작성이 제한되어 있습니다. 해제 예정: ${new Date(restrictionUntil).toLocaleString()}`,
            },
            { status: 403 },
          );
        }
      }
    }

    // 서버에서 파일 업로드 및 HTML 처리
    const processedContent = await replaceBlobsWithS3UrlsServer(content, imageFiles, videoFiles);

    const result = await client.query(
      "INSERT INTO posts (board_id, board_name, url_slug, user_id, user_nickname, title, content) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [boardId, boardname, url_slug, user_id, user_nickname, title, processedContent],
    );

    await client.query("UPDATE members SET all_posts = all_posts + 1 WHERE id = $1", [user_id]);
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
