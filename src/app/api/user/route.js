import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "../../db/db";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../db/s3";

const bucketName = process.env.AWS_BUCKET_NAME;

export async function POST(req) {

    const client = await pool.connect();
    try {

        const formData = await req.formData();
        const userid = formData.get("userid");
        const userNickname = formData.get("userNickname");
        const userPassword = formData.get("userPassword");
        const userEmail = formData.get("userEmail");
        const profileImage = formData.get("profileImage");

        // 비밀번호 해쉬
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

        // 이미지 업로드
        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${profileImage.name}`;

        const s3Params = {
            Bucket: bucketName,
            Key: filename,
            Body: buffer,
            ContentType: profileImage.type || 'application/octet-stream',
        };

        const uploadCommand = new PutObjectCommand(s3Params);
        await s3.send(uploadCommand);

        const imgPath = `https://du1qll7elnsez.cloudfront.net/${filename}`;

        const insertResult = await client.query(
            "INSERT INTO members (user_id, password, email, user_nickname, profile) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userid, hashedPassword, userEmail, userNickname, imgPath]
        );

        return NextResponse.json({ success: true, user: insertResult.rows[0], message: "회원가입이 성공했습니다." }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message, message: "회원가입이 실패했습니다." }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(req) {

    const client = await pool.connect();
    
    try {
        const formData = await req.formData();

        const userid = formData.get("userid");
        const userNickname = formData.get("userNickname") || null;
        const userPassword = formData.get("userPassword") || null;
        const userEmail = formData.get("userEmail") || null;
        const profileImage = formData.get("profileImage") || null;

        // 기존 사용자 확인
        const userResult = await client.query("SELECT * FROM members WHERE id = $1", [userid]);
        const user = userResult.rows[0];

        const updateFields = [];
        const updateValues = [];
        let valueIndex = 1;

        // 닉네임 변경
        if (userNickname && userNickname !== user.usernickname) {
            updateFields.push(`user_nickname = $${valueIndex++}`);
            updateValues.push(userNickname);
        }

        // 비밀번호 변경 (입력값이 있을 경우에만 해싱 후 업데이트)
        if (userPassword) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
            updateFields.push(`password = $${valueIndex++}`);
            updateValues.push(hashedPassword);
        }

        // 이메일 변경
        if (userEmail && userEmail !== user.email) {
            updateFields.push(`email = $${valueIndex++}`);
            updateValues.push(userEmail);
        }

        // 프로필 이미지 변경
        let imgPath = user.profile;
        if (profileImage) {
            const bytes = await profileImage.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${profileImage.name}`;

            const s3Params = {
                Bucket: bucketName,
                Key: filename,
                Body: buffer,
                ContentType: profileImage.type || "application/octet-stream",
            };

            const uploadCommand = new PutObjectCommand(s3Params);
            await s3.send(uploadCommand);

            imgPath = `https://du1qll7elnsez.cloudfront.net/${filename}`;
            updateFields.push(`profile = $${valueIndex++}`);
            updateValues.push(imgPath);
        }

        // 변경된 데이터가 없다면 업데이트하지 않음
        if (updateFields.length === 0) {
            return NextResponse.json({ success: false, message: "변경된 정보가 없습니다." }, { status: 400 });
        }

        // 업데이트 쿼리 실행
        const updateQuery = `
            UPDATE members 
            SET ${updateFields.join(", ")}
            WHERE id = $${valueIndex}
            RETURNING *;
        `;
        updateValues.push(userid);

        const updateResult = await client.query(updateQuery, updateValues);

        return NextResponse.json({ success: true, user: updateResult.rows[0], message: "회원 정보가 업데이트되었습니다." }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message, message: "회원 정보 업데이트에 실패했습니다." }, { status: 500 });
    } finally {
        client.release();
    }
}
