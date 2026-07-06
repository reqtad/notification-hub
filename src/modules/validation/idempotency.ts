import { prisma } from '@/lib/prisma';

export async function checkIdempotency(idempotencyKey: string) {
  const existing = await prisma.notification.findUnique({
    where: { idempotencyKey },
    select: { id: true, status: true },
  });

  return {
    isDuplicate: !!existing,
    existingNotificationId: existing?.id,
    status: existing?.status,
  };
}