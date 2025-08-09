import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  }).$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as { 
  prisma: ReturnType<typeof createPrismaClient> | undefined 
};

// ใช้ global instance เพื่อหลีกเลี่ยงการสร้าง client ใหม่
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;