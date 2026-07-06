import { ChannelType } from '@prisma/client';

export interface SendResult {
  success: boolean;
  provider: string;
  error?: string;
}

export async function sendNotificationChannel(
  channel: ChannelType,
  recipientTarget: string,
  content: string,
  subject?: string
): Promise<SendResult> {
  switch (channel) {
    case 'EMAIL':
      return await sendEmailProvider(recipientTarget, content, subject);
    case 'SMS':
      return await sendSmsProvider(recipientTarget, content);
    case 'PUSH':
      return await sendPushProvider(recipientTarget, content);
    case 'IN_APP':
      return await sendInAppProvider(recipientTarget, content);
    default:
      return { success: false, provider: 'UNKNOWN', error: 'Kênh thông báo không được hỗ trợ' };
  }
}

// ----------------------------------------------------
// CÁC ADAPTER NHÀ CUNG CẤP (PROVIDERS)
// ----------------------------------------------------

async function sendEmailProvider(to: string, content: string, subject?: string): Promise<SendResult> {
  try {
    // Nếu bạn dùng thư viện Resend, bạn có thể gọi resend.emails.send(...) tại đây
    console.log(`📧 [EMAIL PROVIDER] Gửi tới: ${to} | Tiêu đề: ${subject || 'N/A'}`);
    console.log(`Nội dung: ${content}`);
    
    return { success: true, provider: 'Resend' };
  } catch (error: any) {
    return { success: false, provider: 'Resend', error: error.message };
  }
}

async function sendSmsProvider(phone: string, content: string): Promise<SendResult> {
  console.log(`📱 [SMS PROVIDER] Gửi tới SĐT: ${phone} | Nội dung: ${content}`);
  return { success: true, provider: 'Twilio' };
}

async function sendPushProvider(token: string, content: string): Promise<SendResult> {
  console.log(`🔔 [PUSH PROVIDER] Gửi tới Token: ${token} | Nội dung: ${content}`);
  return { success: true, provider: 'Firebase FCM' };
}

async function sendInAppProvider(userId: string, content: string): Promise<SendResult> {
  console.log(`💬 [IN-APP PROVIDER] Gửi tới User ID: ${userId} | Nội dung: ${content}`);
  return { success: true, provider: 'WebSocket / In-App DB' };
}