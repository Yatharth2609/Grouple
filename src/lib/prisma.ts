import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  try {
    const prisma = new PrismaClient({
      log: ['warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Test connection immediately
    prisma.$connect()
      .then(() => console.log('✅ Database connected successfully'))
      .catch((e) => console.error('❌ Database connection error:', e.message));

    return prisma;
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error);
    // Fallback to return a valid client instance even if initialization fails
    return new PrismaClient();
  }
}

// Create a new instance if it doesn't exist
export const client = globalThis.prisma || createPrismaClient();

// In development, store the instance in globalThis to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}
