import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin in Prisma database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

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
