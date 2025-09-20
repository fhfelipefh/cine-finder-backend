import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? [] : ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export { prisma };