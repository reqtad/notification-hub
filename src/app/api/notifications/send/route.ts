import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Client as QStashClient } from '@upstash/qstash';

const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Kiểm tra chống trùng lặp (Deduplication)
    const existing = await prisma.notification.findUnique({
      where: { idempotencyKey: body.idempotencyKey }
    });
    if (existing) return NextResponse.json({ error: 'Duplicate request' }, { status: 409 });

    // 2. Tạo bản ghi PENDING trong Neon DB
    const notificationId = `ntf_${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notificationId,
        idempotencyKey: body.idempotencyKey,
        sourceService: body.sourceService,
        recipientTarget: body.recipientTarget,
        channel: body.channel,
        priority: body.priority || 'MEDIUM',
        status: 'PENDING',
        templateKey: body.templateKey,
        templateData: body.templateData || {},
      }
    });

    // 3. Đẩy Job vào Upstash QStash
    // Lưu ý: QStash sẽ gọi lại API worker của bạn trên Vercel
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    await qstash.publishJSON({
      url: `${appUrl}/api/notifications/worker`,
      body: { notificationId },
      // Hỗ trợ Scheduler Module: Hẹn giờ delay tính bằng giây
      delay: body.delaySeconds ? `${body.delaySeconds}s` : undefined,
      // Tự động thử lại tối đa 3 lần nếu worker bị lỗi
      retries: 3,
    });

    // 4. Cập nhật trạng thái QUEUED
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'QUEUED' }
    });

    return NextResponse.json({ success: true, notificationId, status: 'QUEUED' }, { status: 202 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}