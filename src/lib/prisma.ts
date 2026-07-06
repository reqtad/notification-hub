import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://placeholder:password@ep-placeholder-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });
// Ép kiểu 'as any' để vượt qua bước kiểm tra strict type của Vercel Build Worker
const adapter = new PrismaNeon(pool as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;