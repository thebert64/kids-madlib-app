import { PrismaClient } from '@prisma/client';

// Player emails are private: leave them out of every query result (and so every API response).
const clientOptions = { omit: { player: { email: true } } } as const;

let prisma: PrismaClient<typeof clientOptions>;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(clientOptions);
} else {
  // Avoid instantiating multiple instances during development
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient<typeof clientOptions>;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      ...clientOptions,
      log: ['error'],
    });
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
