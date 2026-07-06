import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Tạo connection string (có chuỗi giả lập phòng trường hợp Vercel kiểm tra tĩnh lúc build)
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://placeholder:password@ep-placeholder-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

// 2. Khởi tạo Neon Connection Pool và Prisma Driver Adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// 3. Khởi tạo PrismaClient chuẩn Prisma 7 với thuộc tính `adapter` duy nhất hợp lệ
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;