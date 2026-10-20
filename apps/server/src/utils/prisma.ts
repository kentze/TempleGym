import { PrismaClient } from "@prisma/client";

// Force a fresh client instance to bypass the global development cache
export const prisma = new PrismaClient({ log: ["error", "warn"] });

process.on("SIGINT", () => prisma.$disconnect());
process.on("SIGTERM", () => prisma.$disconnect());
