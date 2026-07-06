import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

const prisma = new PrismaClient();

// Hàm xử lý chính khi QStash gửi Job tới
async function handler(req: NextRequest) {
  try {
    const { notificationId } = await req.json();
    console.log(`[Worker Processing] ID: ${notificationId}`);

    // 1. Cập nhật trạng thái PROCESSING
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'PROCESSING' }
    });

    // 2. Lấy Template và Render Handlebars
    const template = await prisma.template.findFirst({
      where: { key: notification.templateKey }
    });
    
    let content = template?.content || "Thông báo: {{message}}";
    const dataObj = notification.templateData as Record<string, any>;
    Object.entries(dataObj).forEach(([key, val]) => {
      content = content.replaceAll(`{{${key}}}`, String(val));
    });

    // 3. GỬI TIN NHẮN THỰC TẾ (Gọi Resend Email / Twilio ở đây)
    console.log(`🚀 [SENDING ${notification.channel}] To: ${notification.recipientTarget} | Content: ${content}`);
    
    // Giả lập gửi thành công
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' }
    });

    // Ghi Log thành công
    await prisma.notificationLog.create({
      data: {
        notificationId,
        status: 'SENT',
        provider: 'Resend',
        durationMs: 150
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Worker Error]:', error);
    // Trả về lỗi 500 để Upstash QStash biết đường tự động Retry sau vài phút!
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bọc handler bằng chữ ký bảo mật của QStash
export const POST = verifySignatureAppRouter(handler);