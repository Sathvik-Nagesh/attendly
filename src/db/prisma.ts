/**
 * Attendex — Prisma Client Singleton
 * 
 * Prevents multiple Prisma Client instances in development (hot reload).
 * Standard Next.js pattern from Prisma docs.
 * 
 * NOTE: Run `npx prisma generate` after schema changes to generate the client.
 * If the client hasn't been generated yet, this module safely exports null.
 */

let prisma: any = null;

try {
  // Prisma v7 may use @prisma/client or a generated output path
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as {
    prisma: InstanceType<typeof PrismaClient> | undefined;
  };

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch {
  // Prisma client not generated yet — this is fine during initial setup
  console.warn(
    "[DB] Prisma client not available. Run `npx prisma generate` to set up."
  );
}

export { prisma };
export default prisma;


