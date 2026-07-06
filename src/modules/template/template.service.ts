import { prisma } from '@/lib/prisma';
import { ChannelType } from '@prisma/client';

export interface RenderedTemplate {
  subject?: string;
  content: string;
}

export async function renderNotificationTemplate(
  templateKey: string,
  channel: ChannelType,
  locale: string = 'vi',
  data: Record<string, any> = {}
): Promise<RenderedTemplate> {
  // 1. Tìm mẫu thiết kế trong Database
  const template = await prisma.template.findFirst({
    where: {
      key: templateKey,
      channel: channel,
      locale: locale,
    },
  });

  // Sử dụng nội dung mặc định nếu chưa kịp tạo template trong DB
  let rawContent = template?.content || `[Thông báo hệ thống]: {{message}}`;
  let rawSubject = template?.subject || `Thông báo mới`;

  // 2. Engine render biến động (Handlebars-style replacement)
  Object.entries(data).forEach(([key, val]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rawContent = rawContent.replace(regex, String(val));
    if (rawSubject) {
      rawSubject = rawSubject.replace(regex, String(val));
    }
  });

  return {
    subject: rawSubject,
    content: rawContent,
  };
}