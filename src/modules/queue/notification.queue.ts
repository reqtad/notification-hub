import { Client as QStashClient } from '@upstash/qstash';

const qstash = new QStashClient({
  token: process.env.QSTASH_TOKEN || 'mock_token',
});

export interface QueueDispatchOptions {
  notificationId: string;
  delaySeconds?: number;
  retries?: number;
}

export async function dispatchNotificationJob({
  notificationId,
  delaySeconds = 0,
  retries = 3,
}: QueueDispatchOptions) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const targetUrl = `${appUrl}/api/notifications/worker`;

  console.log(`⏳ [Queue Service] Đang đẩy Job ${notificationId} tới QStash (${targetUrl})...`);

  return await qstash.publishJSON({
    url: targetUrl,
    body: { notificationId },
    // Cấu hình thời gian trì hoãn (Scheduler)
    delay: delaySeconds > 0 ? `${delaySeconds}s` : undefined,
    retries,
  });
}