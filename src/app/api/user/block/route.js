import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
    try {
        const { userId } = await request.json();
        
        // 차단 기록 추가
        await prisma.blockedUser.create({
            data: {
                blockerId: userId,
                blockedId: userId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('차단 실패:', error);
        return NextResponse.json({ success: false, message: '차단에 실패했습니다.' }, { status: 500 });
    }
} 