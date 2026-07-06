import { z } from 'zod';

export const SendNotificationSchema = z.object({
  idempotencyKey: z.string().min(1, 'Idempotency Key là bắt buộc'),
  sourceService: z.string().min(1, 'Tên Service gọi API là bắt buộc'),
  recipientTarget: z.string().min(1, 'Target người nhận không được để trống'),
  channel: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  templateKey: z.string().min(1, 'Template Key không được để trống'),
  templateData: z.record(z.string(), z.any()).default({}),
  locale: z.string().default('vi'),
  // Hỗ trợ Scheduler: Hẹn giờ delay tính bằng giây (mặc định 0 là gửi ngay)
  delaySeconds: z.number().int().nonnegative().optional().default(0),
});

export type SendNotificationPayload = z.infer<typeof SendNotificationSchema>;