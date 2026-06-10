import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString && connectionString !== 'postgresql://postgres:postgres@localhost:5432/web_logbook_magang?schema=public') {
    // Standard database connection pool
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  } else {
    // Setup fallback pool so it doesn't crash during local compilation/build steps 
    // when connection string is missing or is the default placeholder.
    const pool = new pg.Pool();
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
