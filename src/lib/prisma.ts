import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Chuẩn cấu hình cho Prisma 7.x: Bắt buộc truyền datasourceUrl
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'postgresql://placeholder-for-build:5432/db',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;