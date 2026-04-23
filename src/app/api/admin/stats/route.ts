import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [totalUsers, activeSubscriptions, totalDraws, totalWinners] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'active', expiryDate: { gt: new Date() } } }),
      prisma.draw.count(),
      prisma.winner.count(),
    ]);

    // Monthly revenue estimate
    const monthlyRevenue = activeSubscriptions * 15;

    // Recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        charity: { select: { name: true } },
      },
    });

    return NextResponse.json({
      stats: { totalUsers, activeSubscriptions, totalDraws, totalWinners, monthlyRevenue },
      recentUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
