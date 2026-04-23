import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check for standard Vercel CRON authorization if deployed
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete audit logs older than 30 days
    const deletedLogs = await prisma.pointsAuditLog.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${deletedLogs.count} old audit logs.`,
      deletedCount: deletedLogs.count,
    });
  } catch (error) {
    console.error('Failed to clear old audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
