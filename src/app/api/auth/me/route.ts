import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        charityId: true,
        charityPercentage: true,
        charity: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSubscription = user.subscriptions[0] || null;
    const isSubscribed = currentSubscription?.status === 'active' && new Date(currentSubscription.expiryDate) > new Date();

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        charityId: user.charityId,
        charityPercentage: user.charityPercentage,
        charity: user.charity,
        subscription: currentSubscription,
        isSubscribed
      }
    });
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
